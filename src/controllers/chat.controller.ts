import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/Asynchandler";
import { Request, Response, NextFunction } from "express";
import {Chat} from "../models/chat.model"


interface IChat {
  participent: string[];
  messages: {
    _id: string;
    sender: string;
    content: string;
    createdAt: Date;
  }[];
}

interface ChatDocument extends IChat, Document {}

interface AuthenticatedRequest extends Request {
  user?: { _id: string };
}

export const getUserChat = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = (req.user as { _id: string })._id;
    const selectedChatId = req.params.selectedChatId;

    const page = parseInt(req.query.page as string) || 1;
    const limit = 100; // Limit the number of messages per page

    // Step 1: Count messages specific to the chat between two users
    const chat = (await Chat.findOne({
      participent: { $all: [userId, selectedChatId] },
    })) as unknown as ChatDocument;

    if (!chat) {
      return next(new ApiError(404, "No Chat Found"));
    }

    const totalMessages = chat.messages.length; // Count the total number of messages in the chat
    const totalPages = Math.ceil(totalMessages / limit);
    const nextPage = page < totalPages ? page + 1 : null;

    const skip = (page - 1) * limit;

    // Step 2: Fetch the messages with pagination
    const paginatedChat = (await Chat
      .findOne({
        participent: { $all: [userId, selectedChatId] },
      })
      .populate({
        path: "messages",
        options: {
          skip: skip,
          limit: limit,
          sort: { createdAt: -1 },
        },
      }) )as unknown as ChatDocument;

    res.status(200).json(
      new ApiResponse(
        200,
        {
          data: paginatedChat.messages,
          page,
          nextPage,
          totalPages,
          totalMessages,
        },
        "User Messages"
      )
    );
  }
);
