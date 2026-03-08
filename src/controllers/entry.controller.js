import prisma from "../prisma.js"
import axios from "axios"
import { InferenceClient } from "@huggingface/inference";


function getPositiveItem(output) {
  return output.filter(item => item.label === "POSITIVE")
}

function classifySentiment(item) {
  if (item.score > 0.5) return "POSITIVE";
  if (Math.abs(item.score - 0.5) < 1e-6) return "NEUTRAL"; // treat ~0.5 as neutral
  return "NEGATIVE";
}

function getWords(results) {
  return results.map(item => item.word)
}





export const createEntry = async (req, res, next) => {
  try {
    const userId = req.user.userId
    const { content, entry_type } = req.body

    const client = new InferenceClient(process.env.HF_TOKEN);

    const output = await client.textClassification({
      model: "distilbert/distilbert-base-uncased-finetuned-sst-2-english",
      inputs: content,
      provider: "hf-inference",
    });

    const item = getPositiveItem(output)[0]
    // const suggestions = await getSuggestion(content)


    const entry = await prisma.entry.create({
      data: {
        content,
        entry_type,
        user: { connect: { id: userId } },
        sentiment: classifySentiment(item),
        sentiment_score: item.score,
      }
    })
    if (!entry) {
      return res.status(500).json({ message: "request error" })
    }

    const keywords = await client.tokenClassification({
      model: "ml6team/keyphrase-extraction-kbir-inspec",
      inputs: content,
      provider: "hf-inference",
    });
    const words = getWords(keywords)
    console.log(words)

    for (const w of words) {
      const key = await prisma.keyword.create({
        data: {
          keyword: w,
          entries: {
            connect: { id: entry.id }
          }
        }
      })
    }


    const entryWKeywords = await prisma.entry.findUnique({
      where: { id: entry.id },
      include: {
        keywords: true
      }
    })

    res.json(entryWKeywords)
  } catch (err) {
    next(err)
  }
}

export const getEntries = async (req, res, next) => {
  try {
    const userId = req.user.userId
    const entries = await prisma.entry.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        content: true,
        sentiment: true,
        sentiment_score:true,
        keywords: true,
        created_at: true,
        entry_type: true,
        deleted_at:true,
      }
    })

    res.json(entries)
  } catch (err) {
    next(err)
  }
}

export const deleteEntry = async(req,res,next) =>{
  const id  = parseInt(req.params.id)

  try {
    const result = await prisma.entry.update({
      where: {id},
      data: {
        deleted_at: new Date()
      }
    })
    console.log(result)
    res.json(result)
  } catch(err){
    next(err)
  }
}