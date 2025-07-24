import { useEffect, useState, type ChangeEvent } from "react"
import { social } from "../data/social"
import DevTreeInput from "../components/DevTreeInput";
import { isValidUrl } from "../utils";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "../api/DevTreeApi";
import type { SocialNetworks, User } from "../types";

export default function LinkTreeView() {
  const [devTreeLinks, setDevTreeLinks] = useState(social);
  const queryClient = useQueryClient();
  const user: User = queryClient.getQueryData(['user'])!;

  const { mutate } = useMutation({
    mutationFn: updateProfile,
    onError: error => toast.error(error.message),
    onSuccess: () => {
      toast.success('Actualizado correctamente')
    }
  });

  useEffect(() => {
    const parsedLinks = JSON.parse(user.links || '[]');

    const updateData = social.map(item => {
      const userLink = parsedLinks.find((link: SocialNetworks) => link.name === item.name);
      if (userLink) {
        return {
          ...item,
          url: userLink.url,
          enabled: userLink.enabled,
        }
      }
      return item;
    });
    setDevTreeLinks(updateData);
  }, [user.links]);

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const updateLinks = devTreeLinks.map(link => link.name === e.target.name ? { ...link, url: e.target.value } : link);
    setDevTreeLinks(updateLinks);
    queryClient.setQueryData(['user'], (prevData: User) => {
      return {
        ...prevData,
        links: JSON.stringify(updateLinks),
      }
    });
  }

  const handleEnableLink = (socialNetworks: string) => {
    const updateLinks = devTreeLinks.map(link => {
      if (link.name === socialNetworks) {
        if (isValidUrl(link.url)) {
          return { ...link, enabled: !link.enabled }
        } else {
          toast.error('URL no válida');
        }
      }
      return link
    });
    setDevTreeLinks(updateLinks);

    queryClient.setQueryData(['user'], (prevData: User) => {
      return {
        ...prevData,
        links: JSON.stringify(updateLinks),
      }
    });
  }

  return (
    <>
      <div className="space-y-5">
        {devTreeLinks.map(item => (
          <DevTreeInput
            key={item.name}
            item={item}
            handleUrlChange={handleUrlChange}
            handleEnableLink={handleEnableLink}
          />
        ))}
        <button
          className="bg-cyan-400 p-2 text-lg w-full uppercase text-slate-600 rounded font-bold"
          onClick={() => mutate(user)}
        >
          Guardar Cambios
        </button>
      </div>
    </>
  )
}
