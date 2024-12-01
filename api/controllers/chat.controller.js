import prisma from "../lib/prisma.js";

export const getChats = async (req,res)=>{
    const tokenUsedId = req.userId;

    try{
        const chats = await prisma.chat.findMany({
            where: {
                userIDs: {
                    hasSome: [tokenUsedId],
                },
            },
        });

        for (const chat of chats) {
            const receiverId = chat.userIDs.find((id) => id != tokenUsedId);

            const receiver = await prisma.user.findUnique({
                where: {
                    id: receiverId,
                },

                select:{
                    id: true,
                    username: true,
                    avatar: true,
                },
            });
            chat.receiver = receiver;
        }

        res.status(200).json(chats)
    }catch(err){
        console.log(err)
        res.status(500).json({message:"Failed to get chats!"})
    }
};

export const getChat = async (req,res)=>{
const tokenUsedId = req.userId;

    try{
        const chat = await prisma.chat.findUnique({
            where:{
                id: req.params.id,
                userIDs:{
                    hasSome: [tokenUsedId],
                },
            },
            include:{
                messages: {
                    orderBy:{
                        createdAt: "asc",
                    },
                },
            },
        });

        await prisma.chat.update({
            where:{
                id:req.params.id
            },
            data:{
                seenBy:{
                    set:[tokenUsedId]
                }
            }
        })
        res.status(200).json(chat);
    }catch(err){
        console.log(err);
        res.status(500).json({message:"Failed to get chat!"});
    }
};

export const addChat = async (req,res)=>{
    const tokenUsedId = req.userId
    try{

        const newChat = await prisma.chat.create({
            data: {
                userIDs: [tokenUsedId, req.body.receiverId]
            }
        })
        res.status(200).json(newChat)
    }catch(err){
        console.log(err)
        res.status(500).json({message:"Failed to add chat!"})
    }
};

export const readChat = async (req,res)=>{
    const tokenUsedId = req.userId

    try{
        const chat = await prisma.chat.update({
            where:{
                id: req.params.id,
                userIDs:{
                    hasSome: [tokenUsedId],
                },
            },
            data: {
                seenBy:{
                    set: [tokenUsedId],
                },
            },
        });
        res.status(200).json(chat);
    }catch(err){
        console.log(err)
        res.status(500).json({message:"Failed to read chat!"})
    }
};
