import prisma from "../prisma.js"
import { getJson } from "serpapi"


function getSuggestionMarkdown(content,location) {
  return new Promise((resolve, reject) => {
    getJson({
      engine: "google_ai_mode",
      q: `Based on these recent tweets from a user, suggest one specific thing they would find interesting. 
  PRIORITY: Favor LOCAL events and resources if a location is provided.
  
  This could be:
  1. A resource (article, book, video, or online tool).
  2. An event (local meetup, conference, webinar, or online workshop).
  
  User's recent tweets:
  ${content}
  
  ${location ? `User's current location: ${location}` : ""}
  Current date: ${new Date().toLocaleDateString()}
  
  Use your knowledge and search capabilities to find a real, high-quality, and CURRENT resource or event. If you suggest an event, try to find one happening soon in the user's area.`,
      api_key: process.env.SERP_API
    }, (json) => {

      if (!json) return resolve(null)

      resolve(json["reconstructed_markdown"])
    })
  })
}
export const getSuggestion = async (req,res,next) =>{
    const userId = req.user.userId
    const location = req.body
    console.log(location)
    try {
        const diaryEntries = await prisma.entry.findMany({
            where: {
                user_id: userId,
                entry_type: "DIARY"
            },
            orderBy: {
                created_at: "desc"
            },
            take: 10
        })

        const context = diaryEntries.map(e => e.content).join("\n\n")

        const markdown = await getSuggestionMarkdown(context, location)
        const entry = await prisma.entry.create({
            data: {
                content: markdown,
                entry_type: "AI_DISCOVERY",
                user: {connect: {id: userId}},
                                

            }
        })
        res.json(entry)
    }catch(err){
        next(err)
    }
}