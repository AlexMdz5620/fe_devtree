import { useForm } from "react-hook-form"
import ErrorMess from "../components/ErrorMess";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProfileForm, User } from "../types";
import { updateProfile, uploadImage } from "../api/DevTreeApi";
import { toast } from "sonner";
import type { ChangeEvent } from "react";


export default function ProfileView() {
  const queryClient = useQueryClient();
  const data: User = queryClient.getQueryData(['user'])!;

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: {
      handle: data.handle,
      description: data.description,
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onError: errors => { toast.error(errors.message); },
    onSuccess: data => {
      toast.success(data);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });
  
  const uploadImageMutation = useMutation({
    mutationFn: uploadImage,
    onError: errors => { console.log(errors.message); },
    onSuccess: data => {
      console.log(data);
      queryClient.setQueryData(['user'], (prevData: User) => {
        return {
          ...prevData,
          image: data
        }
      });
    }
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadImageMutation.mutate(e.target.files[0]);
    }
  }

  const handleUserProfileForm = (formData: ProfileForm) => {
    updateProfileMutation.mutate(formData);
  }

  return (
    <form
      className="bg-white p-10 rounded-lg space-y-5"
      onSubmit={handleSubmit(handleUserProfileForm)}
    >
      <legend className="text-2xl text-slate-800 text-center">Editar Información</legend>
      <div className="grid grid-cols-1 gap-2">
        <label
          htmlFor="handle"
        >Handle:</label>
        <input
          type="text"
          className="border-none bg-slate-100 rounded-lg p-2"
          placeholder="handle o Nombre de Usuario"
          {...register('handle', {
            required: 'El nombre del usuario es obligatorio'
          })}
        />
        {errors.handle && <ErrorMess>{errors.handle.message}</ErrorMess>}
      </div>

      <div className="grid grid-cols-1 gap-2">
        <label
          htmlFor="description"
        >Descripción:</label>
        <textarea
          className="border-none bg-slate-100 rounded-lg p-2"
          placeholder="Tu Descripción"
          {...register('description', {
            required: 'La descripción es obligatorio'
          })}
        />
        {errors.description && <ErrorMess>{errors.description.message}</ErrorMess>}
      </div>

      <div className="grid grid-cols-1 gap-2">
        <label
          htmlFor="handle"
        >Imagen:</label>
        <input
          id="image"
          type="file"
          name="handle"
          className="border-none bg-slate-100 rounded-lg p-2"
          accept="image/*"
          onChange={handleChange}
        />
      </div>

      <input
        type="submit"
        className="bg-cyan-400 p-2 text-lg w-full uppercase text-slate-600 rounded-lg font-bold cursor-pointer"
        value='Guardar Cambios'
      />
    </form>
  )
}