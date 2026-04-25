import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const change = (lng: "en" | "pt") => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lng", lng);
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Globe className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase">{i18n.language?.slice(0, 2) || "en"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => change("en")}>🇺🇸 {t("language.en")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => change("pt")}>🇧🇷 {t("language.pt")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
