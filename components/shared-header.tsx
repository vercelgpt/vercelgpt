"use client"

import * as React from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { aiModels } from "@/lib/constants"
import { ChevronDown } from "lucide-react"

const HeaderModelSelector = ({
  currentModel,
  onModelChange,
}: { currentModel: string; onModelChange: (model: string) => void }) => {
  const [selectedModel, setSelectedModel] = React.useState(aiModels.find((m) => m.id === currentModel) || aiModels[0])
  const [isOpen, setIsOpen] = React.useState(false)

  const handleModelSelect = (model: { id: string; name: string }) => {
    setSelectedModel(model)
    onModelChange(model.id)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 text-black dark:text-white font-medium text-base hover:bg-gray-100 dark:hover:bg-[#2a2a2a] rounded-lg px-2 py-1 transition-colors">
          <span>{selectedModel.name}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        className="w-64 p-0 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded-2xl shadow-lg"
      >
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Modele</span>
          </div>

          <div className="space-y-1">
            {aiModels.map((model) => (
              <button
                key={model.id}
                onClick={() => handleModelSelect(model)}
                className="w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-[#2a2a2a] group flex items-center justify-between"
              >
                <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{model.name}</span>
                {selectedModel.id === model.id && (
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface SharedHeaderProps {
  showModelSelector?: boolean
  currentModel?: string
  onModelChange?: (model: string) => void
  title?: string
}

export function SharedHeader({
  showModelSelector = false,
  currentModel = "gemini-1.5-pro",
  onModelChange = () => {},
  title = "GPT UI",
}: SharedHeaderProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 px-3 py-3 bg-transparent backdrop-blur-sm">
      <div className="grid grid-cols-3 items-center">
        <div className="flex justify-start items-center gap-1">
          <SidebarTrigger />
          {showModelSelector ? (
            <HeaderModelSelector currentModel={currentModel} onModelChange={onModelChange} />
          ) : (
            <span className="text-black dark:text-white font-medium text-base">{title}</span>
          )}
        </div>

        <div className="flex justify-center"></div>

        <div />
      </div>
    </div>
  )
}
