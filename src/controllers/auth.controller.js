import bcrypt from "bcrypt";
import prisma from "../prisma.js";
import { signToken } from "../utils/jwt.js";

export const register = async (req, res, next) => {
  try {
    console.log(req.body)
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password_hash: hashedPassword,
        username: email,
      },
    });

    const token = signToken({ userId: user.id });

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({ userId: user.id });

    res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (err) {
    next(err);
  }
};
export const me = async (req,res,next)=>{
    try {
        const userId = req.user.userId
        const user = await prisma.user.findUnique({
            where: {id: userId},
            select: {
                id: true,
                username: true,
                email: true,
                created_at: true,
            }
        })
        if (!user) {
            return res.status(404).json({message: "user not found"})
        }


        return res.status(200).json({
            success:true,
            data: user
        })
    }catch(err){
        console.error("get me error: ", err)
        return res.status(500).json({message: "internal server error"})
       
    }
}
