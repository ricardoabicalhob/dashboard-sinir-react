import { useContext, useState } from "react";
import { Check, ChevronsUpDown, Calendar } from "lucide-react"; 
import { cn } from "@/lib/utils"; 
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SystemContext } from "@/contexts/system.context";


export default function YearSelectPicker() {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const {
    anoSelecionado,
    setAnoSelecionado,
    anoCorrente
  } = useContext(SystemContext)

  const anosPredefinidos = [
    { value: `${anoCorrente}`, label: `${anoCorrente}` },
    { value: `${anoCorrente - 1}`, label: `${anoCorrente - 1}` },
    { value: `${anoCorrente - 2}`, label: `${anoCorrente - 2}` },
  ];

  const allYears = Array.from(new Set([...anosPredefinidos, { value: `${anoSelecionado}`, label: `${anoSelecionado}`}]))
                         .sort((a, b) => parseInt(b.value) - parseInt(a.value));

  const handleSelectYear = (yearString :string) => {
    setAnoSelecionado(yearString)
    setInputValue("")
    setOpen(false)
  }


  return (
    <div className="pr-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[180px] justify-between"
          >
            <div className="flex w-full items-center gap-3">
              <Calendar className="w-4 h-4 text-black" />
              {anoSelecionado
                ? allYears.find((ano) => ano.value === `${anoSelecionado}`)?.label
                : "Selecione o ano..."}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[180px] p-0">
          <Command>
            <CommandInput
              placeholder="Buscar ou digitar ano..."
              value={inputValue}
              onValueChange={(value) => {
                setInputValue(value)
              }}
              onKeyDown={e => {
                if(e.key === "Enter") {
                    e.preventDefault()

                    const selectedItem = allYears.find(
                        ano => ano.label === inputValue
                    )

                    if(selectedItem) {
                        handleSelectYear(selectedItem.value)
                    } else {
                        if (inputValue.length === 4) { // Verifica se é um número inteiro válido
                            setAnoSelecionado(inputValue);
                        } else if (inputValue === "") {
                            // setAnoSelecionado(anoCorrente.toString()); // Ou outro valor padrão
                        }       
                    }
                }
              }}
            />
            <CommandList>
              <CommandEmpty>Nenhum ano encontrado.</CommandEmpty>
              <CommandGroup>
                {allYears.map((ano) => (
                  <CommandItem
                    key={ano.value}
                    value={ano.value}
                    onSelect={(currentValue) => {
                      handleSelectYear(currentValue)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        anoSelecionado === ano.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {ano.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}