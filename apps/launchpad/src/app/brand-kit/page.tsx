export default function BrandKitPage() {
  const colors = [
    { name: "Primary Green", hex: "#0F5331", usage: "Primary buttons, active states, CTAs" },
    { name: "Primary Orange", hex: "#FA5302", usage: "Accents, highlights, brand emphasis" },
    { name: "Primary Blue", hex: "#021822", usage: "Base background, deep dark surfaces" },
    { name: "Callout Yellow", hex: "#CBFF02", usage: "Callouts, alerts, attention-grabbers" },
    { name: "Secondary Cool Grey", hex: "#F1F9FF", usage: "Primary text, light surfaces" },
    { name: "Secondary Tan", hex: "#D9D0C0", usage: "Muted text, subtle accents" },
  ];

  const darkScale = [
    { step: "950", hex: "#021822", label: "Base BG" },
    { step: "900", hex: "#0a2533", label: "Card BG" },
    { step: "800", hex: "#152f3d", label: "Borders" },
    { step: "700", hex: "#1f3f52", label: "Hover BG" },
    { step: "600", hex: "#3a5a70", label: "Muted" },
    { step: "500", hex: "#5f7f94", label: "Secondary text" },
    { step: "400", hex: "#8ba3b4", label: "Labels" },
    { step: "300", hex: "#b4c8d4", label: "Subtext" },
    { step: "200", hex: "#d4e2eb", label: "Light text" },
    { step: "100", hex: "#F1F9FF", label: "Primary text" },
  ];

  const typeScale = [
    { name: "Display", size: "2rem (32px)", weight: "700", use: "Page titles" },
    { name: "H1", size: "1.563rem (25px)", weight: "700", use: "Section headings" },
    { name: "H2", size: "1.25rem (20px)", weight: "600", use: "Card titles" },
    { name: "Body", size: "1rem (16px)", weight: "400", use: "Paragraph text" },
    { name: "Small", size: "0.8rem (12.8px)", weight: "400", use: "Captions, labels" },
    { name: "Micro", size: "0.64rem (10.2px)", weight: "600", use: "Badges, tags" },
  ];

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold font-heading uppercase tracking-wider text-zinc-100">
          Brand Kit
        </h1>
        <p className="text-zinc-400 mt-2">
          Capacitr Hack-a-thon visual identity — colors, typography, and component style guide.
        </p>
      </div>

      {/* Brand Colors */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-200 mb-4 font-heading uppercase tracking-wide">
          Brand Colors
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {colors.map((c) => (
            <div key={c.hex} className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="h-20" style={{ backgroundColor: c.hex }} />
              <div className="p-3">
                <div className="text-sm font-semibold text-zinc-100">{c.name}</div>
                <div className="text-xs text-zinc-400 font-mono mt-0.5">{c.hex}</div>
                <div className="text-[10px] text-zinc-500 mt-1">{c.usage}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dark Scale */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-200 mb-4 font-heading uppercase tracking-wide">
          Dark Scale (Zinc Override)
        </h2>
        <p className="text-sm text-zinc-400 mb-4">
          The zinc palette is overridden with blue-tinted shades derived from Primary Blue (#021822).
        </p>
        <div className="flex rounded-xl overflow-hidden border border-zinc-800">
          {darkScale.map((s) => (
            <div key={s.step} className="flex-1 group relative">
              <div className="h-16" style={{ backgroundColor: s.hex }} />
              <div className="p-1.5 bg-zinc-900 text-center">
                <div className="text-[9px] font-mono text-zinc-400">{s.step}</div>
              </div>
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-zinc-800 text-zinc-100 text-[10px] px-2 py-1 rounded whitespace-nowrap border border-zinc-700 z-10">
                {s.hex} — {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-200 mb-4 font-heading uppercase tracking-wide">
          Typography
        </h2>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Headings</div>
            <div className="text-2xl font-bold font-heading uppercase tracking-wider text-zinc-100">
              Gridnik Bold
            </div>
            <div className="text-xs text-zinc-500 mt-2">
              Stack: Gridnik → Space Grotesk → Arial → sans-serif
            </div>
            <div className="text-[10px] text-zinc-600 mt-1">
              Uppercase · letter-spacing: wider · font-weight: 700
            </div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Body</div>
            <div className="text-2xl text-zinc-100">
              Arial / Helvetica
            </div>
            <div className="text-xs text-zinc-500 mt-2">
              Stack: Arial → Helvetica → sans-serif
            </div>
            <div className="text-[10px] text-zinc-600 mt-1">
              Normal case · line-height: 1.5 · font-weight: 400
            </div>
          </div>
        </div>

        {/* Type Scale */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase tracking-wider">
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-left px-4 py-2">Size</th>
                <th className="text-left px-4 py-2">Weight</th>
                <th className="text-left px-4 py-2">Use</th>
              </tr>
            </thead>
            <tbody>
              {typeScale.map((t) => (
                <tr key={t.name} className="border-b border-zinc-800/50">
                  <td className="px-4 py-2.5 font-medium text-zinc-200">{t.name}</td>
                  <td className="px-4 py-2.5 font-mono text-zinc-400 text-xs">{t.size}</td>
                  <td className="px-4 py-2.5 text-zinc-400">{t.weight}</td>
                  <td className="px-4 py-2.5 text-zinc-500 text-xs">{t.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Buttons */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-200 mb-4 font-heading uppercase tracking-wide">
          Buttons
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors">
            Primary Action
          </button>
          <button className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-semibold border border-zinc-700 transition-colors">
            Secondary
          </button>
          <button className="px-5 py-2.5 bg-brand-orange hover:opacity-90 text-white rounded-lg text-sm font-semibold transition-colors">
            Accent (Orange)
          </button>
          <button className="px-4 py-1.5 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
            Text Link →
          </button>
        </div>
      </section>

      {/* Status Badges */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-200 mb-4 font-heading uppercase tracking-wide">
          Status Badges
        </h2>
        <div className="flex flex-wrap gap-3">
          <span className="px-2.5 py-1 bg-indigo-900/50 text-indigo-300 text-xs font-medium rounded-full border border-indigo-700/50">
            Active
          </span>
          <span className="px-2.5 py-1 bg-yellow-900/30 text-yellow-300 text-xs font-medium rounded-full border border-yellow-700/50">
            Pending
          </span>
          <span className="px-2.5 py-1 bg-red-900/30 text-red-300 text-xs font-medium rounded-full border border-red-700/50">
            Closed
          </span>
          <span className="px-2.5 py-1 bg-zinc-800 text-zinc-400 text-xs font-medium rounded-full border border-zinc-700">
            Draft
          </span>
          <span className="px-2.5 py-1 bg-brand-orange/20 text-brand-orange text-xs font-medium rounded-full border border-brand-orange/30">
            Featured
          </span>
        </div>
      </section>

      {/* Cards */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-200 mb-4 font-heading uppercase tracking-wide">
          Cards
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 hover:border-zinc-700 transition-colors">
            <div className="text-sm font-semibold text-zinc-100 mb-1">Standard Card</div>
            <div className="text-xs text-zinc-500">
              bg-zinc-900 · border-zinc-800 · rounded-xl · hover:border-zinc-700
            </div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-indigo-800/50 p-5 ring-1 ring-indigo-600/20">
            <div className="text-sm font-semibold text-indigo-300 mb-1">Active / Selected Card</div>
            <div className="text-xs text-zinc-500">
              border-indigo-800/50 · ring-1 ring-indigo-600/20
            </div>
          </div>
        </div>
      </section>

      {/* Form Elements */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-200 mb-4 font-heading uppercase tracking-wide">
          Form Elements
        </h2>
        <div className="grid md:grid-cols-2 gap-4 max-w-2xl">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Text Input</label>
            <input
              type="text"
              placeholder="Enter value..."
              readOnly
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Select</label>
            <select className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-600">
              <option>Option A</option>
              <option>Option B</option>
            </select>
          </div>
        </div>
      </section>

      {/* Spacing Scale */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-200 mb-4 font-heading uppercase tracking-wide">
          Spacing Scale
        </h2>
        <div className="space-y-2">
          {[
            { name: "xs", value: "4px", tw: "p-1" },
            { name: "sm", value: "8px", tw: "p-2" },
            { name: "md", value: "16px", tw: "p-4" },
            { name: "lg", value: "24px", tw: "p-6" },
            { name: "xl", value: "40px", tw: "p-10" },
          ].map((s) => (
            <div key={s.name} className="flex items-center gap-4">
              <div className="w-12 text-xs font-mono text-zinc-400">{s.tw}</div>
              <div
                className="bg-indigo-600/30 rounded"
                style={{ width: s.value, height: "20px" }}
              />
              <div className="text-xs text-zinc-500">
                {s.name} — {s.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tailwind Config Note */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-zinc-200 mb-4 font-heading uppercase tracking-wide">
          Implementation Notes
        </h2>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 text-sm text-zinc-400 space-y-3">
          <p>
            The brand is applied by <strong className="text-zinc-200">overriding Tailwind&apos;s zinc and indigo palettes</strong> in{" "}
            <code className="text-indigo-400 text-xs">tailwind.config.js</code>. All existing{" "}
            <code className="text-zinc-300 text-xs">bg-zinc-*</code> and{" "}
            <code className="text-zinc-300 text-xs">bg-indigo-*</code> classes automatically inherit brand colors — no class name changes needed.
          </p>
          <p>
            Custom brand tokens are available via{" "}
            <code className="text-zinc-300 text-xs">brand-orange</code>,{" "}
            <code className="text-zinc-300 text-xs">brand-yellow</code>,{" "}
            <code className="text-zinc-300 text-xs">brand-green</code>,{" "}
            <code className="text-zinc-300 text-xs">brand-dark</code>,{" "}
            <code className="text-zinc-300 text-xs">brand-grey</code>, and{" "}
            <code className="text-zinc-300 text-xs">brand-tan</code>.
          </p>
          <p>
            Headings use <code className="text-zinc-300 text-xs">font-heading</code> class (Gridnik → Space Grotesk fallback).
            Once Gridnik font files are available, uncomment the @font-face in{" "}
            <code className="text-indigo-400 text-xs">globals.css</code>.
          </p>
        </div>
      </section>
    </div>
  );
}
