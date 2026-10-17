import { useId, useState, type FormEvent } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Device } from "@/lib/api/schemas"
import { deviceLabel } from "@/lib/format"

interface DialogProps {
  device: Device
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RenameDialog({
  device,
  open,
  onOpenChange,
  onSave,
}: DialogProps & { onSave: (name: string) => void }) {
  const id = useId()
  const [name, setName] = useState(device.name)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSave(name.trim())
    onOpenChange(false)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Nombre del teléfono</DialogTitle>
            <DialogDescription>
              Usa un seudónimo, como "Participante 2". Nunca el nombre real.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor={id}>Seudónimo</Label>
            <Input
              id={id}
              value={name}
              maxLength={80}
              autoFocus
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function LimitDialog({
  device,
  open,
  onOpenChange,
  onSave,
}: DialogProps & { onSave: (minutes: number) => void }) {
  const id = useId()
  const [value, setValue] = useState(String(device.daily_minutes_limit ?? ""))
  const minutes = value.trim() === "" ? 0 : Number(value)
  const invalid = !Number.isInteger(minutes) || minutes < 0 || minutes > 1440
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (invalid) return
    onSave(minutes)
    onOpenChange(false)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit} className="flex flex-col gap-5">
          <DialogHeader>
            <DialogTitle>Minutos por día</DialogTitle>
            <DialogDescription>
              Al llegar al límite la sesión se cierra y el teléfono lo avisa en
              voz alta. Vacío o 0, sin límite. Cuenta en hora de Colombia.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor={id}>Minutos</Label>
            <Input
              id={id}
              inputMode="numeric"
              value={value}
              autoFocus
              aria-invalid={invalid}
              aria-describedby={`${id}-help`}
              onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ""))}
              className="tabular font-mono"
            />
            <p id={`${id}-help`} className="text-sm text-muted-foreground">
              Hoy lleva {Math.round(device.minutes_today)} min.
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={invalid}>
              Guardar límite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function DeleteDialog({
  device,
  open,
  onOpenChange,
  onConfirm,
}: DialogProps & { onConfirm: () => void }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Borrar "{deviceLabel(device)}"?</AlertDialogTitle>
          <AlertDialogDescription>
            Se borran sus sesiones y los logs que subió. Si el teléfono vuelve a
            abrir Lazarus, aparecerá otra vez como pendiente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Borrar teléfono
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
