"use server";

import { addNameFormSchema } from "@/components/submit-name-form";
import { prisma } from "@/lib/db/prisma";
import { PrismaClientKnownRequestError } from "../../../prisma/generated/internal/prismaNamespace";
import { User } from "better-auth";
import * as z from "zod";

export async function addName(
  values: z.infer<typeof addNameFormSchema>,
  user: User | null,
) {
  if (!user) {
    return { ok: false, message: "You need to be logged in to add a name." };
  }

  try {
    const [userExists, nameExists] = await Promise.all([
      prisma.user.findUnique({ where: { id: user.id } }),
      prisma.name.findUnique({ where: { name: values.name } }),
    ]);

    if (!userExists) {
      return {
        ok: false,
        message: "User account not found. Please log in again.",
      };
    }

    if (nameExists) {
      return {
        ok: false,
        message: `The name "${values.name}" has already been added.`,
      };
    }

    await prisma.name.create({
      data: {
        name: values.name,
        gender: values.gender,
        nicknames: {
          create:
            values.nicknames?.map((nickname: string) => ({
              nickname: {
                connectOrCreate: {
                  where: { nickname },
                  create: { nickname },
                },
              },
            })) || [],
        },
        meaning: values.meaning || null,
        additionalInfo: values.additionalInfo || null,
        addedBy: { connect: { id: user.id } },
      },
    });

    return {
      ok: true,
      message: `The name "${values.name}" has been added successfully. Thank you for your contribution!`,
    };
  } catch (error: unknown) {
    let errorMessage = "An unexpected error occurred. Please try again later.";

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        errorMessage = `The name "${values.name}" already exists in the database.`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { ok: false, message: errorMessage };
  }
}
