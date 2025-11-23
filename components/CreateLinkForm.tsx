"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateLink } from "@/hooks/useLinks";
import { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
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
          <label className="block text-sm font-medium text-black mb-2">
            Long URL
          </label>
          <input
            placeholder="https://example.com/very/long/url"
            {...register("longUrl")}
            disabled={createLink.isPending}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-0 disabled:bg-gray-100 disabled:text-gray-500"
          />
          {errors.longUrl && (
            <p className="text-red-600 text-sm mt-1">{errors.longUrl.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Custom Shortcode (optional)
          </label>
          <input
            placeholder="Auto-generated"
            {...register("shortCode")}
            disabled={createLink.isPending}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-0 disabled:bg-gray-100 disabled:text-gray-500"
          />
          {errors.shortCode && (
            <p className="text-red-600 text-sm mt-1">{errors.shortCode.message}</p>
          )}
        </div>
      </div>

      {createLink.isError && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <XCircle className="h-4 w-4 shrink-0" />
          <span>
            {createLink.error instanceof Error
              ? createLink.error.message
              : "Failed to create link"}
          </span>
        </div>
      )}

      {showSuccess && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Link created successfully!</span>
        </div>
      )}

      <button
        type="submit"
        disabled={createLink.isPending}
        className="w-full px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {createLink.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          "Create Short Link"
        )}
      </button>
    </form>
  );
}