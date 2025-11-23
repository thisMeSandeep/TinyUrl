"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { useCreateLink } from "@/hooks/useLinks";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { createLinkSchema } from "@/lib/validations";
import type { CreateLinkInput } from "@/lib/validations";

type CreateLinkFormData = CreateLinkInput;

interface CreateLinkFormProps {
  onSuccess?: () => void;
}

export function CreateLinkForm({ onSuccess }: CreateLinkFormProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const createLink = useCreateLink();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateLinkFormData>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      longUrl: "",
      shortCode: "",
    },
  });

  const onSubmit = async (data: CreateLinkFormData) => {
    try {
      await createLink.mutateAsync({
        longUrl: data.longUrl,
        shortCode: data.shortCode || undefined,
      });
      setShowSuccess(true);
      reset();
      setTimeout(() => setShowSuccess(false), 3000);
      onSuccess?.();
    } catch (error) {
      // Error is handled by react-query
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Long URL"
            placeholder="https://example.com/very/long/url"
            {...register("longUrl")}
            error={errors.longUrl?.message}
            disabled={createLink.isPending}
          />
        </div>
        <div>
          <Input
            label="Custom Shortcode (optional)"
            placeholder="Auto-generated"
            {...register("shortCode")}
            error={errors.shortCode?.message}
            disabled={createLink.isPending}
          />
        </div>
      </div>

      {createLink.isError && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <XCircle className="h-4 w-4" />
          <span>
            {createLink.error instanceof Error
              ? createLink.error.message
              : "Failed to create link"}
          </span>
        </div>
      )}

      {showSuccess && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle2 className="h-4 w-4" />
          <span>Link created successfully!</span>
        </div>
      )}

      <Button
        type="submit"
        isLoading={createLink.isPending}
        disabled={createLink.isPending}
      >
        Create Short Link
      </Button>
    </form>
  );
}

