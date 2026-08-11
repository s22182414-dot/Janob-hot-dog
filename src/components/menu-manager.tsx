import {
  Check,
  ChevronDown,
  ImagePlus,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { formatSom, resolveImage } from "@/data/menu";
import type { MenuItem } from "@/data/menu";
import { useMenu } from "@/lib/use-menu";

const CATEGORY_OPTIONS: MenuItem["category"][] = [
  "Hot-Doglar",
  "Gazaklar",
  "Ichimliklar",
];

type FormState = {
  editingId: string | null;
  name: string;
  description: string;
  price: string;
  category: MenuItem["category"];
  tag: string;
  image: string;
};

const emptyForm: FormState = {
  editingId: null,
  name: "",
  description: "",
  price: "",
  category: "Hot-Doglar",
  tag: "",
  image: "",
};

function CategorySelect({
  value,
  onChange,
}: {
  value: MenuItem["category"];
  onChange: (c: MenuItem["category"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`glass flex w-full items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary ${
          open ? "border-primary" : ""
        }`}
      >
        {value}
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="glass-strong absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl py-1">
          {CATEGORY_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                onChange(c);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                c === value
                  ? "bg-ember-gradient font-medium text-primary-foreground"
                  : "text-muted-foreground hover:bg-black/20 hover:text-foreground"
              }`}
            >
              {c}
              {c === value && <Check className="size-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function MenuManager() {
  const { items, addItem, updateItem, removeItem } = useMenu();
  const [form, setForm] = useState<FormState | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !form) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Faqat rasm fayli tanlang");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      const img = new Image();
      img.onload = () => {
        try {
          // Katta rasmlarni 800px gacha kichraytirib, JPEG sifatida siqamiz
          const MAX = 800;
          const scale = Math.min(1, MAX / Math.max(img.width, img.height));
          const w = Math.max(1, Math.round(img.width * scale));
          const h = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            patch({ image: src });
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          patch({ image: canvas.toDataURL("image/jpeg", 0.82) });
        } catch {
          patch({ image: src });
        }
      };
      img.onerror = () => patch({ image: src });
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const patch = (p: Partial<FormState>) =>
    setForm((f) => (f ? { ...f, ...p } : f));

  const startAdd = (category: MenuItem["category"] = "Hot-Doglar") => {
    setConfirmId(null);
    setForm({ ...emptyForm, category });
  };

  const startEdit = (item: MenuItem) => {
    setConfirmId(null);
    setForm({
      editingId: item.id,
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: item.category,
      tag: item.tag ?? "",
      image: item.image,
    });
  };

  const cancel = () => setForm(null);

  const submit = () => {
    if (!form) return;
    const price = Number(form.price);
    if (!form.name.trim()) {
      toast.error("Taom nomini kiriting");
      return;
    }
    if (!price || price <= 0) {
      toast.error("Narx noto'g'ri");
      return;
    }
    if (!form.image) {
      toast.error("Rasm yuklang");
      return;
    }
    const data: Omit<MenuItem, "id"> = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      category: form.category,
      ...(form.tag.trim() ? { tag: form.tag.trim() } : {}),
      image: form.image,
    };
    if (form.editingId) {
      updateItem(form.editingId, data);
      toast.success("Taom yangilandi");
    } else {
      addItem(data);
      toast.success("Taom qo'shildi");
    }
    setForm(null);
  };

  const onDelete = (id: string) => {
    if (confirmId === id) {
      removeItem(id);
      setConfirmId(null);
      toast.success("Taom o'chirildi");
    } else {
      setConfirmId(id);
    }
  };

  const previewSrc = resolveImage(form?.image ?? "");

  return (
    <div className="glass mt-6 rounded-3xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
          <ImagePlus className="size-5 text-primary" /> Taomlar va menyu
        </h2>
        <button
          onClick={() => startAdd()}
          className="bg-ember-gradient lift flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="size-4" /> Yangi taom qo'shish
        </button>
      </div>

      {form &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <button
              aria-label="Formani yopish"
              onClick={cancel}
              className="animate-in fade-in absolute inset-0 bg-background/70 backdrop-blur-sm duration-300"
            />
            <div className="glass-strong animate-in fade-in zoom-in-95 relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6 duration-300">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display font-semibold">
                  {form.editingId ? "Taomni tahrirlash" : "Yangi taom"}
                </h3>
                <button
                  onClick={cancel}
                  className="glass flex size-8 items-center justify-center rounded-full transition-colors hover:text-destructive"
                  aria-label="Yopish"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium">Nom *</span>
                  <input
                    value={form.name}
                    onChange={(e) => patch({ name: e.target.value })}
                    placeholder="Masalan: Chili Dog"
                    className="glass w-full rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium">
                    Narx (so'm) *
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => patch({ price: e.target.value })}
                    placeholder="Masalan: 25000"
                    className="glass w-full rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                  />
                </label>
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1.5 block font-medium">Tavsif</span>
                  <textarea
                    value={form.description}
                    onChange={(e) => patch({ description: e.target.value })}
                    rows={2}
                    placeholder="Taom haqida qisqacha"
                    className="glass w-full resize-none rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium">Kategoriya</span>
                  <CategorySelect
                    value={form.category}
                    onChange={(c) => patch({ category: c })}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium">
                    Belgisi (ixtiyoriy)
                  </span>
                  <input
                    value={form.tag}
                    onChange={(e) => patch({ tag: e.target.value })}
                    placeholder="Masalan: Oshpaz tanlovi, Achchiq"
                    className="glass w-full rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                  />
                </label>

                <div className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium">
                    Rasm *
                  </span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={onFile}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 bg-black/20 px-4 py-6 text-sm transition-colors hover:border-primary/60 hover:bg-black/30"
                  >
                    {form.image ? (
                      <>
                        <img
                          src={previewSrc}
                          alt="Yuklangan rasm"
                          className="aspect-[4/3] w-full max-w-[240px] rounded-xl object-cover"
                        />
                        <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                          <Upload className="size-4" /> Rasmni almashtirish
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="bg-ember-gradient flex size-11 items-center justify-center rounded-2xl">
                          <Upload className="size-5 text-primary-foreground" />
                        </span>
                        <span className="font-medium">
                          Kompyuterdan rasm yuklash
                        </span>
                        <span className="text-xs text-muted-foreground">
                          JPG, PNG yoki WEBP — bosib tanlang
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={submit}
                  className="bg-ember-gradient lift rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  {form.editingId ? "Saqlash" : "Qo'shish"}
                </button>
                <button
                  onClick={cancel}
                  className="glass rounded-xl px-5 py-2.5 text-sm font-medium transition-colors hover:text-destructive"
                >
                  Bekor qilish
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Menyu bo'sh — yangi taom qo'shing
        </p>
      ) : (
        <div className="mt-6 space-y-8">
          {CATEGORY_OPTIONS.map((category) => {
            const sectionItems = items.filter((m) => m.category === category);
            return (
              <section key={category}>
                <h3 className="font-display flex items-center gap-3 text-base font-semibold">
                  {category}
                  <span className="text-ember-gradient text-xs font-medium">
                    {sectionItems.length} ta
                  </span>
                </h3>
                {sectionItems.length === 0 ? (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-black/20 px-4 py-3">
                    <p className="text-sm text-muted-foreground">
                      Bu bo'limda hozircha taom yo'q
                    </p>
                    <button
                      onClick={() => startAdd(category)}
                      className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <Plus className="size-3.5" /> Qo'shish
                    </button>
                  </div>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {sectionItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex flex-wrap items-center gap-3 rounded-2xl bg-black/20 px-4 py-3"
                      >
                        <img
                          src={resolveImage(item.image)}
                          alt={item.name}
                          className="size-12 shrink-0 rounded-xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-center gap-x-2 font-medium">
                            {item.name}
                            {item.tag && (
                              <span className="glass rounded-full px-2 py-0.5 text-[11px] font-medium">
                                {item.tag}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatSom(item.price)}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            onClick={() => startEdit(item)}
                            className="glass flex size-9 items-center justify-center rounded-xl transition-colors hover:bg-primary hover:text-primary-foreground"
                            aria-label="Tahrirlash"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => onDelete(item.id)}
                            className={`flex size-9 items-center justify-center rounded-xl transition-colors ${
                              confirmId === item.id
                                ? "bg-destructive text-destructive-foreground"
                                : "glass hover:bg-destructive hover:text-destructive-foreground"
                            }`}
                            aria-label="O'chirish"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                        {confirmId === item.id && (
                          <p className="w-full text-right text-xs text-destructive">
                            Yana bosing — o'chiriladi
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
