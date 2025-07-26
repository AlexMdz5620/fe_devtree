import { useEffect, useState, type ChangeEvent } from "react"
import { social } from "../data/social"
import DevTreeInput from "../components/DevTreeInput";
import { isValidUrl } from "../utils";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "../api/DevTreeApi";
import type { SocialNetwork, User } from "../types";

export default function LinkTreeView() {
  const [devTreeLinks, setDevTreeLinks] = useState(social);

  const queryClient = useQueryClient();
  const user: User = queryClient.getQueryData(['user'])!;

  const { mutate } = useMutation({
    mutationFn: updateProfile,
    onError: (error) => toast.error(error.message),
    onSuccess: () => {
      toast.success('Actualizado Correctamente')
    }
  });

  useEffect(() => {
    const updateData = devTreeLinks.map(item => {
      const userLinks = JSON.parse(user.links).find((link: SocialNetwork) => item.name === link.name);
      if (userLinks) {
        return { ...userLinks, url: userLinks.url, enabled: userLinks.enabled }
      }
      return item;
    });

    setDevTreeLinks(updateData);
  }, []);

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const updatedLinks = devTreeLinks.map(link => link.name === e.target.name ? { ...link, url: e.target.value } : link);
    setDevTreeLinks(updatedLinks);
  }

  const links: SocialNetwork[] = JSON.parse(user.links);

  const handleEnableLink = (socialNetworks: string) => {
    const updatedLinks = devTreeLinks.map(link => {
      if (link.name === socialNetworks) {
        if (isValidUrl(link.url)) {
          return { ...link, enabled: !link.enabled };
        } else {
          toast.error('URL no válida');
        }
      }
      return link;
    });

    setDevTreeLinks(updatedLinks);

    const selectedLink = updatedLinks.find(link => link.name === socialNetworks);
    const existing = links.find(link => link.name === socialNetworks);
    let updatedItems: SocialNetwork[] = [];

    if (selectedLink?.enabled) {
      // Rehabilitando el link
      const maxId = Math.max(0, ...links.map(link => link.id || 0));
      const newId = existing?.id && existing.id > 0 ? existing.id : maxId + 1;

      if (existing) {
        updatedItems = links.map(link =>
          link.name === socialNetworks
            ? { ...link, enabled: true, id: newId }
            : link
        );
      } else {
        updatedItems = [...links, { ...selectedLink, id: newId }];
      }

    } else {
      // Deshabilitando el link
      const disabledLink = links.find(link => link.name === socialNetworks);
      if (!disabledLink) return;

      const disabledId = disabledLink.id;

      updatedItems = links
        .map(link => {
          if (link.name === socialNetworks) {
            return { ...link, enabled: false, id: 0 }; // desactivado
          } else if (link.id > disabledId) {
            return { ...link, id: link.id - 1 }; // reacomodar
          }
          return link;
        })
        .filter(link => link.id !== 0 || link.enabled); // opcional: eliminar los desactivados si quieres
    }

    queryClient.setQueryData(['user'], (prevData: User) => ({
      ...prevData,
      links: JSON.stringify(updatedItems),
    }));
  };



  return (
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
        onClick={() => mutate(queryClient.getQueryData(['user'])!)}
      >
        Guardar cambios
      </button>
    </div>
  )
}
