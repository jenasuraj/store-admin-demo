import { CSSProperties, useState, useCallback } from "react";

// ─── Schema ───────────────────────────────────────────────────────────────────
type FieldKey = keyof typeof SCHEMA;

const SCHEMA = {
  billToCompany: (v: string) => !v?.trim() ? "Company name is required" : null,
  billToAddress: (v: string) => !v?.trim() || v.trim().length < 5 ? "Address is required" : null,
  shipToCompany: (v: string) => !v?.trim() ? "Company name is required" : null,
  shipToAddress: (v: string) => !v?.trim() || v.trim().length < 5 ? "Address is required" : null,
  itemDesc:      (v: string) => !v?.trim() ? "Description is required" : null,
  sac: (v: string) => {
    const d = (v || "").replace(/\D/g, "");
    if (!d) return "SAC code is required";
    if (d.length !== 6) return `Must be exactly 6 digits (${d.length}/6)`;
    return null;
  },
  qty:     (v: string) => !v || isNaN(+v) || +v <= 0 ? "Enter a valid quantity" : null,
  rate:    (v: string) => !v || isNaN(+v) || +v <= 0 ? "Enter a valid rate" : null,
  igstPct: (v: string) => !v || isNaN(+v) || +v <= 0 || +v > 100 ? "Enter a valid IGST %" : null,
  bankName:  (v: string) => !v?.trim() ? "Bank name is required" : null,
  accountNo: (v: string) => !v?.trim() || v.trim().length < 8 ? "Min 8 characters required" : null,
  ifsc: (v: string) => {
    if (!v?.trim()) return "IFSC is required";
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(v.trim())) return "Invalid IFSC (e.g. HDFC0000271)";
    return null;
  },
} as const;

type FormValues = {
  invoiceNo: string; invoiceDate: string;
  billToCompany: string; billToAddress: string;
  shipToCompany: string; shipToAddress: string;
  itemDesc: string; sac: string; qty: string; rate: string; igstPct: string;
  bankName: string; accountNo: string; ifsc: string; branchAddress: string;
};

const INITIAL: FormValues = {
  invoiceNo: "", invoiceDate: "",
  billToCompany: "", billToAddress: "",
  shipToCompany: "", shipToAddress: "",
  itemDesc: "", sac: "", qty: "", rate: "", igstPct: "",
  bankName: "", accountNo: "", ifsc: "", branchAddress: "",
};

const fmt = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Typed style helpers ──────────────────────────────────────────────────────
// Returning CSSProperties directly fixes all boxSizing / textAlign TS errors
const baseInput: CSSProperties = {
  fontFamily: "IBM Plex Sans, sans-serif",
  fontSize: 13,
  color: "#1a1a1a",
  padding: "8px 10px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",   // ✅ valid because return type is CSSProperties
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const inp = (hasError: boolean): CSSProperties => ({
  ...baseInput,
  background: hasError ? "#fdf3f2" : "#fff",
  border: `1px solid ${hasError ? "#c0392b" : "#d1c9b8"}`,
});

const tc = (extra: CSSProperties = {}): CSSProperties => ({
  padding: "10px 8px",
  verticalAlign: "top",
  borderBottom: "1px solid #ede9e0",
  ...extra,
});

// ─── Toast ────────────────────────────────────────────────────────────────────
type Toast = { id: number; title: string; desc?: string; type: "success" | "error" };

function Toaster({ toasts }: { toasts: Toast[] }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, display: "flex", flexDirection: "column", gap: 10 }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          display: "flex", alignItems: "flex-start", gap: 12,
          background: "#fff", border: "1px solid #d1c9b8",
          borderLeft: `4px solid ${t.type === "success" ? "#1e6b45" : "#c0392b"}`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.13)",
          padding: "13px 18px", minWidth: 290,
          animation: "slideUp 0.2s ease",
        }}>
          <span style={{ fontSize: 15, color: t.type === "success" ? "#1e6b45" : "#c0392b", marginTop: 2 }}>
            {t.type === "success" ? "✓" : "✕"}
          </span>
          <div>
            <div style={{ fontFamily: "IBM Plex Sans, sans-serif", fontWeight: 600, fontSize: 13, color: "#1a1a1a" }}>{t.title}</div>
            {t.desc && <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "#6b6460", marginTop: 2 }}>{t.desc}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
// required and error are optional so <Field label="Branch Address"> compiles fine
function Field({
  label,
  required = false,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 10, fontWeight: 600, letterSpacing: "1.2px", textTransform: "uppercase", color: "#4a4540" }}>
        {label}{required && <span style={{ color: "#c0392b", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {error && (
        <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 10, color: "#c0392b" }}>
          ⚠ {error}
        </span>
      )}
    </div>
  );
}

// ─── Section strip ────────────────────────────────────────────────────────────
function Strip({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#1a3a5c", color: "#fff", padding: "8px 20px", fontFamily: "IBM Plex Mono, monospace", fontSize: 10, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" }}>
      {children}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function TaxInvoiceForm() {
  const [values, setValues]   = useState<FormValues>(INITIAL);
  const [errors, setErrors]   = useState<Partial<Record<FieldKey, string | null>>>({});
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [toasts, setToasts]   = useState<Toast[]>([]);

  const showToast = useCallback((title: string, desc: string, type: Toast["type"] = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, title, desc, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4500);
  }, []);

  const set = (name: keyof FormValues, raw: string) => {
    let v = raw;
    if (name === "sac")  v = raw.replace(/\D/g, "").slice(0, 6);
    if (name === "ifsc") v = raw.toUpperCase();
    setValues((p) => ({ ...p, [name]: v }));
    if (name in SCHEMA) {
      const key = name as FieldKey;
      setTouched((p) => ({ ...p, [key]: true }));
      setErrors((p) => ({ ...p, [key]: SCHEMA[key](v) }));
    }
  };

  const blur = (name: FieldKey) => {
    setTouched((p) => ({ ...p, [name]: true }));
    setErrors((p) => ({ ...p, [name]: SCHEMA[name](values[name] ?? "") }));
  };

  const E = (k: FieldKey): string | null | undefined => touched[k] ? errors[k] : null;

  const subtotal = (+values.qty || 0) * (+values.rate || 0);
  const tax      = subtotal * ((+values.igstPct || 0) / 100);
  const balance  = subtotal + tax;
  const sacLen   = (values.sac || "").length;

  const handleSubmit = () => {
    const errs: Partial<Record<FieldKey, string | null>> = {};
    let bad = false;
    const tch: Partial<Record<FieldKey, boolean>> = {};
    (Object.keys(SCHEMA) as FieldKey[]).forEach((k) => {
      tch[k] = true;
      const e = SCHEMA[k](values[k] ?? "");
      if (e) { errs[k] = e; bad = true; }
    });
    setTouched(tch);
    setErrors(errs);
    if (bad) { showToast("Validation Failed", "Fix the highlighted errors.", "error"); return; }
    showToast("Invoice Submitted", `Balance Due ₹${fmt(balance)}`, "success");
    setValues(INITIAL);
  };

  // Totals rows — key must be a string, not boolean
  const totalsRows: [string, string, boolean][] = [
    ["Sub Total",                          `₹ ${fmt(subtotal)}`, false],
    [`IGST (${values.igstPct || 0}%)`,     `₹ ${fmt(tax)}`,     false],
    ["Balance Due",                        `₹ ${fmt(balance)}`,  true],
  ];

  // Table header alignment typed as CSSProperties["textAlign"]
  type ColAlign = CSSProperties["textAlign"];
  const thCols: [string, ColAlign][] = [
    ["#", "center"], ["Item & Description", "left"],
    ["SAC *", "left"], ["Qty *", "left"],
    ["Rate (₹) *", "left"], ["IGST % *", "left"],
    ["Tax (₹)", "right"], ["Amount (₹)", "right"],
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f4f1eb", padding: "28px 16px", fontFamily: "IBM Plex Sans, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');
        @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        input:focus, select:focus, textarea:focus { border-color:#1a3a5c !important; box-shadow:0 0 0 3px rgba(26,58,92,0.09) !important; outline:none; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 16, borderBottom: "2px solid #d1c9b8" }}>
          <div>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 17, fontWeight: 600, color: "#1a3a5c" }}>ABC Private Limited</div>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 10, color: "#6b6460", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: 3 }}>
              GSTIN 27AAHCD5185H1AI · PAN AAHCD5185
            </div>
          </div>
          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "#1a3a5c", border: "1.5px solid #1a3a5c", padding: "5px 14px" }}>
            Tax Invoice
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #d1c9b8", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>

          {/* ══ Invoice Details ══ */}
          <Strip>Invoice Details</Strip>
          <div style={{ padding: 20, borderBottom: "1px solid #ede9e0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Field label="Invoice Number">
              <input
                value={values.invoiceNo}
                onChange={e => set("invoiceNo", e.target.value)}
                style={inp(false)}
                placeholder="INV-000001"
              />
            </Field>
            <Field label="Invoice Date">
              <input
                type="text"
                value={values.invoiceDate}
                onChange={e => set("invoiceDate", e.target.value)}
                style={inp(false)}
                placeholder="DD/MM/YYYY"
              />
            </Field>
          </div>

          {/* ══ Billing & Shipping ══ */}
          <Strip>Billing &amp; Shipping</Strip>
          <div style={{ padding: 20, borderBottom: "1px solid #ede9e0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
            {/* Bill To */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 10, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9b9189" }}>Bill To</div>
              <Field label="Company Name" required error={E("billToCompany")}>
                <input value={values.billToCompany} onChange={e => set("billToCompany", e.target.value)} onBlur={() => blur("billToCompany")} style={inp(!!E("billToCompany"))} placeholder="Company name" />
              </Field>
              <Field label="Address" required error={E("billToAddress")}>
                <textarea value={values.billToAddress} onChange={e => set("billToAddress", e.target.value)} onBlur={() => blur("billToAddress")} rows={3}
                  style={{ ...inp(!!E("billToAddress")), resize: "vertical", fontFamily: "IBM Plex Sans, sans-serif" } as CSSProperties}
                  placeholder="Street, City, State" />
              </Field>
            </div>
            {/* Ship To */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 10, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9b9189" }}>Ship To</div>
              <Field label="Company Name" required error={E("shipToCompany")}>
                <input value={values.shipToCompany} onChange={e => set("shipToCompany", e.target.value)} onBlur={() => blur("shipToCompany")} style={inp(!!E("shipToCompany"))} placeholder="Company name" />
              </Field>
              <Field label="Address" required error={E("shipToAddress")}>
                <textarea value={values.shipToAddress} onChange={e => set("shipToAddress", e.target.value)} onBlur={() => blur("shipToAddress")} rows={3}
                  style={{ ...inp(!!E("shipToAddress")), resize: "vertical", fontFamily: "IBM Plex Sans, sans-serif" } as CSSProperties}
                  placeholder="Street, City, State" />
              </Field>
            </div>
          </div>

          {/* ══ Line Items ══ */}
          <Strip>Line Items</Strip>
          <div style={{ borderBottom: "1px solid #ede9e0", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <colgroup>
                <col style={{ width: 36 }} />
                <col />
                <col style={{ width: 130 }} />
                <col style={{ width: 72 }} />
                <col style={{ width: 108 }} />
                <col style={{ width: 76 }} />
                <col style={{ width: 104 }} />
                <col style={{ width: 112 }} />
              </colgroup>
              <thead>
                <tr style={{ background: "#f0ece4" }}>
                  {thCols.map(([h, align]) => (
                    <th key={h} style={{
                      padding: "9px 10px",
                      textAlign: align,          // ✅ typed as CSSProperties["textAlign"]
                      fontFamily: "IBM Plex Mono, monospace", fontSize: 10,
                      fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase",
                      color: "#4a4540", borderBottom: "1px solid #d1c9b8", whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {/* # */}
                  <td style={tc({ textAlign: "center", fontFamily: "IBM Plex Mono, monospace", fontSize: 12, color: "#9b9189", paddingTop: 16 })}>1</td>

                  {/* Description */}
                  <td style={tc()}>
                    <input value={values.itemDesc} onChange={e => set("itemDesc", e.target.value)} onBlur={() => blur("itemDesc")}
                      style={{ ...inp(!!E("itemDesc")), width: "100%" } as CSSProperties} placeholder="Item description" />
                    {E("itemDesc") && <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 10, color: "#c0392b", marginTop: 3 }}>⚠ {E("itemDesc")}</div>}
                  </td>

                  {/* SAC */}
                  <td style={tc()}>
                    <div style={{ position: "relative" }}>
                      <input
                        value={values.sac}
                        onChange={e => set("sac", e.target.value)}
                        onBlur={() => blur("sac")}
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        style={{ ...inp(!!E("sac")), width: "100%", paddingRight: 38 } as CSSProperties}
                      />
                      {/* Inline overlay — zero layout impact */}
                      <span style={{
                        position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                        fontFamily: "IBM Plex Mono, monospace", fontSize: 9, fontWeight: 600, lineHeight: 1,
                        color: sacLen === 6 ? "#1e6b45" : sacLen > 0 ? "#b7791f" : "#b0a89e",
                        pointerEvents: "none",
                      }}>
                        {sacLen}/6{sacLen === 6 ? " ✓" : ""}
                      </span>
                    </div>
                    {E("sac") && <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 10, color: "#c0392b", marginTop: 3 }}>⚠ {E("sac")}</div>}
                  </td>

                  {/* Qty */}
                  <td style={tc()}>
                    <input type="number" value={values.qty} onChange={e => set("qty", e.target.value)} onBlur={() => blur("qty")}
                      style={{ ...inp(!!E("qty")), width: "100%" } as CSSProperties} placeholder="1" min="1" />
                    {E("qty") && <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 9, color: "#c0392b", marginTop: 3 }}>⚠ {E("qty")}</div>}
                  </td>

                  {/* Rate */}
                  <td style={tc()}>
                    <input type="number" value={values.rate} onChange={e => set("rate", e.target.value)} onBlur={() => blur("rate")}
                      style={{ ...inp(!!E("rate")), width: "100%" } as CSSProperties} placeholder="0.00" min="0" />
                    {E("rate") && <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 9, color: "#c0392b", marginTop: 3 }}>⚠ {E("rate")}</div>}
                  </td>

                  {/* IGST % */}
                  <td style={tc()}>
                    <input type="number" value={values.igstPct} onChange={e => set("igstPct", e.target.value)} onBlur={() => blur("igstPct")}
                      style={{ ...inp(!!E("igstPct")), width: "100%" } as CSSProperties} placeholder="18" min="0" max="100" />
                    {E("igstPct") && <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 9, color: "#c0392b", marginTop: 3 }}>⚠ {E("igstPct")}</div>}
                  </td>

                  {/* Tax — computed */}
                  <td style={tc({ textAlign: "right", fontFamily: "IBM Plex Mono, monospace", fontSize: 12, color: "#4a4540", paddingTop: 16 })}>{fmt(tax)}</td>

                  {/* Amount — computed */}
                  <td style={tc({ textAlign: "right", fontFamily: "IBM Plex Mono, monospace", fontSize: 12, fontWeight: 600, paddingTop: 16 })}>{fmt(subtotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div style={{ padding: "16px 20px", display: "flex", justifyContent: "flex-end", borderBottom: "1px solid #ede9e0" }}>
            <div style={{ width: 256, border: "1px solid #d1c9b8" }}>
              {totalsRows.map(([label, value, hi]) => (
                // key is always a string (label) — no boolean key error
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: hi ? "#1a3a5c" : "transparent", borderBottom: hi ? "none" : "1px solid #ede9e0" }}>
                  <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 10, fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase", color: hi ? "#fff" : "#4a4540" }}>{label}</span>
                  <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 13, fontWeight: 600, color: hi ? "#fff" : "#1a1a1a" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ══ Bank Details ══ */}
          <Strip>Bank Details</Strip>
          <div style={{ padding: 20, borderBottom: "1px solid #ede9e0", background: "#faf8f4", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Bank Name" required error={E("bankName")}>
              <input value={values.bankName} onChange={e => set("bankName", e.target.value)} onBlur={() => blur("bankName")} style={inp(!!E("bankName"))} placeholder="HDFC Bank" />
            </Field>
            <Field label="Account Number" required error={E("accountNo")}>
              <input value={values.accountNo} onChange={e => set("accountNo", e.target.value)} onBlur={() => blur("accountNo")} style={inp(!!E("accountNo"))} placeholder="50200043323451" inputMode="numeric" />
            </Field>
            <Field label="IFSC Code" required error={E("ifsc")}>
              <input value={values.ifsc} onChange={e => set("ifsc", e.target.value.toUpperCase())} onBlur={() => blur("ifsc")} style={inp(!!E("ifsc"))} placeholder="HDFC0000271" />
            </Field>
            {/* required and error omitted — both optional in Field props */}
            <Field label="Branch Address">
              <input value={values.branchAddress} onChange={e => set("branchAddress", e.target.value)} style={inp(false)} placeholder="Branch address (optional)" />
            </Field>
          </div>

          {/* Submit */}
          <div style={{ padding: "18px 20px", display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleSubmit}
              // ✅ use currentTarget (HTMLButtonElement) instead of target (EventTarget)
              onMouseEnter={e => (e.currentTarget.style.background = "#0f2540")}
              onMouseLeave={e => (e.currentTarget.style.background = "#1a3a5c")}
              style={{ background: "#1a3a5c", color: "#fff", border: "none", padding: "11px 32px", fontFamily: "IBM Plex Mono, monospace", fontSize: 11, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", transition: "background 0.15s" }}
            >
              Submit Invoice →
            </button>
          </div>

        </div>
      </div>

      <Toaster toasts={toasts} />
    </div>
  );
}