"use client";

import { addName } from "@/actions/names/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Gender } from "../../prisma/generated/enums";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { TagsInput } from "./ui/tags-input";

const AMHARIC_REGEX = /^[\u1200-\u137F\s]+$/;

export const addNameFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .regex(AMHARIC_REGEX, "Name must be in Amharic"),
  nicknames: z
    .array(z.string().regex(AMHARIC_REGEX, "Nicknames must be in Amharic"))
    .optional(),
  meaning: z.string().optional(),
  gender: z.nativeEnum(Gender),
  additionalInfo: z.string().optional(),
});

export default function MyForm() {
  const { data: session } = useSession();

  const form = useForm<z.infer<typeof addNameFormSchema>>({
    resolver: zodResolver(addNameFormSchema),
    defaultValues: {
      name: "",
      nicknames: [],
      meaning: "",
      additionalInfo: "",
    },
  });

  async function onSubmit(values: z.infer<typeof addNameFormSchema>) {
    try {
      if (!session?.user) {
        toast.error("You must be logged in to submit a name.");
        return;
      }
      const res = await addName(values, session.user);

      if (!res?.ok) {
        throw new Error(res.message);
      }

      toast.success(res.message);
      form.reset({
        name: "",
        nicknames: [],
        meaning: "",
        additionalInfo: "",
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error.message || "An error occurred while submitting the name.",
        );
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-center text-3xl font-bold">Submit a Name</h1>
      <p className="text-muted-foreground mb-8 text-center">
        Share an Ethiopian name with our community
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Name Details</CardTitle>
          <CardDescription>
            Please provide as much information as you know about this name
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mx-auto max-w-3xl space-y-8"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Name<span className="text-xs">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="" type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nicknames"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nicknames</FormLabel>
                    <FormControl>
                      <TagsInput
                        value={field.value || []}
                        onValueChange={field.onChange}
                        placeholder="Enter nicknames. Tap enter to add another"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="meaning"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meaning</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder=""
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>
                      Gender<span className="text-xs">*</span>
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        className="flex flex-row items-center gap-6"
                      >
                        {[
                          ["Male", "MALE"],
                          ["Female", "FEMALE"],
                          ["Unisex", "UNISEX"],
                        ].map((option, index) => (
                          <FormItem
                            className="flex items-center space-y-0"
                            key={index}
                          >
                            <FormControl>
                              <RadioGroupItem value={option[1]} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {option[0]}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Info (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Historical context, famous people with this name, etc."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="text-end">
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
