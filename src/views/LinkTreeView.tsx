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
          return { ...link, enabled: !link.enabled }
        } else {
          toast.error('URL no válida');
        }
      }
      return link
    });

    setDevTreeLinks(updatedLinks);

    let updatedItems: SocialNetwork[] = []
    const selectedSocialNetwork = updatedLinks.find(link => link.name === socialNetworks);
    if (selectedSocialNetwork?.enabled) {
      const id = links.filter(link => link.id).length + 1;
      if (links.some(link => link.name === socialNetworks)) {
        updatedItems = links.map(link => {
          if (link.name === socialNetworks) {
            return {
              ...link,
              enabled: true,
              id,
            }
          } else {
            return link
          }
        })
      } else {
        const newItem = {
          ...selectedSocialNetwork,
          id,
        }
        updatedItems = [...links, newItem];
      }
    } else {
      const indexToUpdate = links.findIndex(link => link.name === socialNetworks);
      updatedItems = links.map(link => {
        if (link.name === socialNetworks) {
          return {
            ...link,
            id: 0,
            enabled: false,
          }
        } else if (link.id > indexToUpdate) {
          return {
            ...link,
            id: link.id - 1
          }
        } else {
          return link
        }
      })
    }

    // Almacenar en la DB
    queryClient.setQueryData(['user'], (prevData: User) => {
      return {
        ...prevData,
        links: JSON.stringify(updatedItems),
      }
    });
  }

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
        onClick={() => mutate(user)}
      >
        Guardar cambios
      </button>
    </div>
  )
}
