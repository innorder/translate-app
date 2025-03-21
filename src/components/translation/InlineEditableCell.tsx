import React, { useState, useRef, useEffect } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface InlineEditableCellProps {
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
  isBaseText?: boolean;
}

const InlineEditableCell: React.FC<InlineEditableCellProps> = ({
  value,
  onSave,
  onCancel,
  placeholder = "Empty",
  isBaseText = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [displayValue, setDisplayValue] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const savedValueRef = useRef(value);
  const [showTranslateAlert, setShowTranslateAlert] = useState(false);

  // Update internal state when prop value changes
  useEffect(() => {
    setEditValue(value);
    setDisplayValue(value);
    savedValueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    // Update the display value immediately
    const newValue = editValue;
    setDisplayValue(newValue);
    savedValueRef.current = newValue;
    setIsEditing(false);

    // If this is a base text (English) and the value has changed significantly
    if (isBaseText && value !== newValue && value.trim() && newValue.trim()) {
      // Show confirmation dialog for auto-translation
      setShowTranslateAlert(true);
    } else {
      // Call onSave immediately for non-base text
      onSave(newValue);
    }
  };

  const handleConfirmAutoTranslate = () => {
    setShowTranslateAlert(false);
    // Get the key ID from the closest parent with a data-key-id attribute
    let keyId = null;
    const keyElement = document.querySelector('[data-editing="true"]');
    if (keyElement) {
      keyId = keyElement.getAttribute("data-key-id");
    }

    // Dispatch an event that the parent component can listen for
    const event = new CustomEvent("auto-translate-request", {
      detail: {
        baseText: editValue,
        keyId: keyId,
      },
    });
    document.dispatchEvent(event);
    // Call onSave after confirming
    onSave(editValue);
  };

  const handleCancelAutoTranslate = () => {
    setShowTranslateAlert(false);
    // Still save the changes, just don't auto-translate
    onSave(editValue);
  };

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    // Reset to the last saved value
    setEditValue(savedValueRef.current);
    setDisplayValue(savedValueRef.current);
    setIsEditing(false);
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div
        className="flex items-start gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1">
          <textarea
            ref={inputRef}
            className="w-full min-h-[60px] p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-green-100 hover:bg-green-200 text-green-700"
            onClick={(e) => handleSave(e)}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-red-100 hover:bg-red-200 text-red-700"
            onClick={(e) => handleCancel(e)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <AlertDialog
        open={showTranslateAlert}
        onOpenChange={setShowTranslateAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Translations</AlertDialogTitle>
            <AlertDialogDescription>
              You've changed the base text. Would you like to auto-update all
              translations?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelAutoTranslate}>
              No thanks
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAutoTranslate}>
              Update All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div
        className="p-2 rounded-md hover:bg-accent/50 cursor-pointer min-h-[40px]"
        onClick={() => setIsEditing(true)}
      >
        {savedValueRef.current ? (
          savedValueRef.current
        ) : (
          <span className="text-gray-400 italic">{placeholder}</span>
        )}
      </div>
    </>
  );
};

export default InlineEditableCell;
