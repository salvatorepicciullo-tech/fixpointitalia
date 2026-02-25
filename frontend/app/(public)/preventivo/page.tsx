'use client';

import { useEffect, useState, useRef } from 'react';

import { useRouter } from 'next/navigation';

/* =======================
   TIPI
======================= */
type DeviceType = { id: number; name: string };
type Brand = { id: number; name: string };
type Model = { id: number; name: string };
type Repair = { id: number; name: string };

export default function PreventivoPage() {
  const router = useRouter();

  /* =======================
     STATE
  ======================= */
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [deviceTypes, setDeviceTypes] = useState<DeviceType[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [isOtherBrand, setIsOtherBrand] = useState(false);

  const [deviceTypeId, setDeviceTypeId] = useState<number | null>(null);
  const [brandId, setBrandId] = useState<number | null>(null);
  const [modelId, setModelId] = useState<number | null>(null);
  const [modelSearch, setModelSearch] = useState('');
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const [repairIds, setRepairIds] = useState<number[]>([]);

  const [color, setColor] = useState('');
  const [city, setCity] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);


const modelInputRef = useRef<HTMLInputElement | null>(null);

 const loadingModels = deviceTypeId && brandId && models.length === 0;

const normalizedSearch = modelSearch
  .toLowerCase()
  .replace(/\s+/g, '');



/* =======================
   V6 MOBILE GOD MODE – SMART SEARCH ENGINE
======================= */

const normalize = (str:string) =>
  str.toLowerCase().replace(/\s+/g,'');

const search = normalize(modelSearch);

const filteredModels = models
  .map(m => {
    const name = normalize(m.name);

    let score = 0;

    // ⭐ match inizio parola (iphone13)
    if(name.startsWith(search)) score += 120;

    // ⭐ contiene testo
    if(name.includes(search)) score += 60;

    // ⭐ boost numeri (13 pro max)
    const nums = search.replace(/[^\d]/g,'');
    if(nums && name.includes(nums)) score += 25;

    // ⭐ bonus modelli recenti (nome lungo)
    if(name.length > 10) score += 5;

    return { ...m, score };
  })
  .filter(m => m.score > 0 || search.length === 0)
  .sort((a,b)=> b.score - a.score || a.name.localeCompare(b.name))
  .slice(0,12); // 🔥 mobile friendly


  /* =======================
     LOAD BASE DATA
  ======================= */
 useEffect(() => {
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/device-types`)
    .then(r => r.json())
    .then(setDeviceTypes);

  fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/brands`)
    .then(r => r.json())
    .then(setBrands);
}, []);

/* =======================
   AUTO SKIP BRAND
======================= */
useEffect(() => {
  if (step === 2 && brands.length === 1) {
    const onlyBrand = brands[0];

    setBrandId(onlyBrand.id);
    setIsOtherBrand(false);

    setTimeout(() => {
      setStep(3);
    }, 120);
  }
}, [brands, step]);


/* =======================
   LOAD REPAIRS DAL LISTINO MODELLO (COME PRIMA)
======================= */
useEffect(() => {

  if (!modelId) {
    setRepairs([]);
    return;
  }

 fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/model-repairs?model_id=${modelId}`)
    .then(r => r.json())
    .then(rows => {

      const mapped = rows.map((x:any) => ({
        id: x.repair_id,
        name: x.repair
      }));

      setRepairs(mapped);
    });

}, [modelId]);



/* =======================
   AUTOCOMPLETE CITTA
======================= */
useEffect(() => {

  if (!city || city.length < 2) {
    setCitySuggestions([]);
    return;
  }

  const timeout = setTimeout(async () => {
    try {
     const res = await fetch(
  `https://nominatim.openstreetmap.org/search?format=json&countrycodes=it&q=${city}`,
  {
    headers: {
      'Accept-Language': 'it'
    }
  }
);


      const data = await res.json();

      setCitySuggestions(data.slice(0,5));
      setShowCityDropdown(true);

    } catch (err) {
      console.log('Errore suggerimenti città', err);
    }
  }, 300);

  return () => clearTimeout(timeout);

}, [city]);


  /* =======================
     LOAD MODELS
  ======================= */
  useEffect(() => {
    if (deviceTypeId == null || brandId == null) {

      setModels([]);
      setModelId(null);
      setRepairIds([]);
      return;
    }
console.log('DEVICE:', deviceTypeId);
console.log('BRAND:', brandId);

   fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/models?device_type_id=${deviceTypeId}&brand_id=${brandId}`
)
      .then(r => r.json())
      .then(data => {
  console.log("MODELS API:", data);
  setModels(Array.isArray(data) ? data : []);
});

  }, [deviceTypeId, brandId]);

/* =======================
   AUTO SKIP MODELLO
======================= */
useEffect(() => {
  if (step === 3 && models.length === 1) {
    const onlyModel = models[0];

    setModelId(onlyModel.id);
    setModelSearch(onlyModel.name);

    setTimeout(() => {
      setStep(4);
    }, 120);
  }
}, [models, step]);


/* =======================
   AUTO FOCUS MODELLO
======================= */
useEffect(() => {
  if (step === 3) {
    setTimeout(() => {
      modelInputRef.current?.focus();
    }, 150);
  }
}, [step]);

/* =======================
   AUTO STEP DOPO MODELLO
======================= */
useEffect(() => {
  if (modelId && step === 3) {
    setStep(4);
  }
}, [modelId]);

/* =======================
   SCROLL TOP CAMBIO STEP
======================= */
useEffect(() => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}, [step]);

/* =======================
   PREFETCH FIXPOINTS (APP SPEED)
======================= */
useEffect(() => {
  // Prefetch solo quando siamo vicini alla fine del funnel
  if (step >= 3 && city) {
    router.prefetch('/preventivo/fixpoints');
  }
}, [step, city, router]);

/* =======================
   CLOSE MODEL DROPDOWN CLICK FUORI
======================= */
useEffect(() => {
  const closeDropdown = (e:any) => {
    // NON chiudere se sto cliccando dentro input modello
    if (modelInputRef.current?.contains(e.target)) return;
    setShowModelDropdown(false);
  };

  window.addEventListener('click', closeDropdown);

  return () => window.removeEventListener('click', closeDropdown);
}, []);


  /* =======================
     TOGGLE RIPARAZIONE
  ======================= */
  const toggleRepair = (id: number) => {
    setRepairIds(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  /* =======================
     NAVIGAZIONE FINALE
  ======================= */
const goToFixpoints = () => {

  // ⭐ FLOW ALTRA MARCA
  if (isOtherBrand) {
    if (!deviceTypeId || !brandId || !city) return;

    const selectedBrand = brands.find(b => b.id === brandId);

    const params = new URLSearchParams({
  deviceTypeId: String(deviceTypeId),
  brandId: String(brandId),
  city,
});

params.set('otherBrand','1'); // ✅ QUI FUORI

    if (selectedBrand)
      params.set('brandName', selectedBrand.name);

    router.replace(`/preventivo/fixpoints?${params.toString()}`);
    return;
  }

  // ⭐ FLOW NORMALE
  if (!deviceTypeId || !brandId || !modelId || repairIds.length === 0 || !city)
    return;


  const brand = brands.find(b => b.id === brandId);
  const model = models.find(m => m.id === modelId);

 const selectedBrand = brands.find(b => b.id === brandId);
const selectedModel = models.find(m => m.id === modelId);

const params = new URLSearchParams({
  deviceTypeId: String(deviceTypeId),
  brandId: String(brandId),
  modelId: String(modelId),
  repairIds: repairIds.join(','),
  city,
});

if (selectedBrand) params.set('brandName', selectedBrand.name);
if (selectedModel) params.set('modelName', selectedModel.name);


if (color) params.append('color', color);

router.replace(`/preventivo/fixpoints?${params.toString()}`);
};


  /* =======================
     UI
  ======================= */
  return (
    <>
      {/* =======================
          FORM PREVENTIVO (INVARIATO)
      ======================= */}
  <div className="
relative overflow-hidden
bg-gradient-to-b from-blue-50 via-sky-50 to-white
px-4
pt-24 lg:pt-32
pb-32
min-h-screen
">

{/* =======================
    SFONDO ONDE DECORATIVE
======================= */}
<div className="absolute inset-0 pointer-events-none">
  <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-3xl" />
  <div className="absolute top-40 -right-32 w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-3xl" />
</div>

  <div className="
max-w-6xl mx-auto
grid lg:grid-cols-2
gap-10 lg:gap-16
items-start
relative z-10
">

      <div
  key={step}
  className="w-full max-w-3xl mx-auto bg-white
lg:rounded-2xl rounded-none
lg:border border-0
shadow-lg
  p-5 md:p-8 space-y-8 pb-32
  transition-all duration-300 ease-out
  animate-[slideStep_.28s_ease]
  "
>




         {/* HEADER */}
<div className="
text-center space-y-1
relative z-10
bg-white/80 backdrop-blur
py-2
border-b border-gray-100
">

            <h1 className="text-3xl font-bold text-gray-900">
              Calcola il tuo preventivo
            </h1>
            <p className="text-gray-600">
              Seleziona il dispositivo e scopri il costo della riparazione
            </p>
          </div>

   {/* STEP INDICATOR */}
<div className="px-2 space-y-3">

  {/* PROGRESS BAR */}
  <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500 ease-out"
      style={{ width: `${(step / 4) * 100}%` }}
    />
  </div>

  {/* STEPS */}
  <div className="
  flex justify-between lg:justify-center
  gap-2 lg:gap-4
  text-xs lg:text-sm
  ">

    {['Dispositivo', 'Marca', 'Modello', 'Riparazioni'].map((label, i) => {
      const s = (i + 1) as 1 | 2 | 3 | 4;
      const active = step === s;
      const done = step > s;

      return (
        <button
          key={label}
          type="button"
          onClick={() => {
            // ⭐ SOLO NAVIGAZIONE INDIETRO
            if (done) setStep(s);
          }}
          className={`group flex items-center gap-2 transition-all duration-200 ${
            active
              ? 'text-blue-600'
              : done
              ? 'text-green-600 cursor-pointer hover:opacity-80 hover:-translate-y-[1px] hover:scale-[1.03]'
              : 'text-gray-400 cursor-default'
          }`}
        >
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              active
                ? 'bg-blue-600 text-white'
                : done
                ? 'bg-green-600 text-white'
                : 'border border-gray-300'
            }`}
          >
            {done ? '✓' : s}
          </span>

          <span className="flex items-center gap-1">
            {label}
            {done && (
              <span className="opacity-0 group-hover:opacity-100 transition">
                ↺
              </span>
            )}
          </span>

        </button>
      );
    })}

  </div>
</div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Tipo di dispositivo</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {deviceTypes.map(d => {
                  const active = deviceTypeId === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => {
                        setDeviceTypeId(d.id);
                        setBrandId(null);
                        setModelId(null);
                        setRepairIds([]);
                      }}
                      className={`rounded-xl border p-4 text-center transition active:scale-95 active:bg-blue-100
 ${
                        active
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-2xl mb-1">
                        {d.name === 'Smartphone' && '📱'}
                        {d.name === 'Tablet' && '📟'}
                        {d.name === 'Smartwatch' && '⌚'}
                        {d.name === 'Console' && '🎮'}
			{d.name === 'Computer' && '💻'}

                      </div>
                      <div className="font-medium">{d.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Marca</h2>
              <select
                className="w-full border rounded-xl px-4 py-3"
                value={brandId ?? ''}
               onChange={e => {

  const value = e.target.value ? Number(e.target.value) : null;
  const label =
    e.target.options[e.target.selectedIndex].text;

  setBrandId(value);
  setModelId(null);
  setRepairIds([]);

  // ⭐ FIXPOINT – ALTRA MARCA MODE
  if (label.toLowerCase() === 'altra marca') {
    setIsOtherBrand(true);
    setStep(4); // salta modello
  } else {
    setIsOtherBrand(false);
  }
}}

              >
                <option value="">Seleziona marca</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

      {/* STEP 3 */}
{step === 3 && !isOtherBrand && (


  <div
    className="relative"
    onClick={(e) => e.stopPropagation()}
  >

    <h2 className="text-lg font-semibold mb-2">Modello</h2>

    <input
      ref={modelInputRef}
      inputMode="search"
      autoComplete="off"
      className="
      w-full border rounded-xl px-4 py-3 text-base
      focus:ring-2 focus:ring-blue-500 outline-none
      "
      value={modelSearch}
      onChange={e => {
  setModelSearch(e.target.value);
  setShowModelDropdown(e.target.value.length > 0);
}}

      placeholder="Scrivi il modello (es. iPhone 11, S21...)"
    />

    {showModelDropdown && filteredModels.length > 0 && (
      <div className="
        absolute left-0 right-0 z-[999]
        bg-white border rounded-xl shadow w-full mt-1
        max-h-72 overflow-auto
      ">

        {filteredModels.slice(0,8).map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              setModelId(m.id);
              setModelSearch(m.name);
              setShowModelDropdown(false);
              setRepairIds([]);
            }}
            className="
              w-full text-left px-4 py-3
              hover:bg-blue-50
              border-b last:border-none
              transition
            "
          >
            🔎 {m.name}
          </button>
        ))}

      </div>
    )}

  </div>
)}



         {/* STEP 4 NORMALE */}
{step === 4 && !isOtherBrand && (




            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">Riparazioni</h2>
                <div className="grid gap-2">
                  {repairs.map(r => {
                    const active = repairIds.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        onClick={() => toggleRepair(r.id)}
                        className={`border rounded-xl p-3 flex justify-between active:scale-95 transition-transform ${
                          active
                            ? 'border-blue-600 bg-blue-50'
                            : 'hover:border-gray-400'
                        }`}
                      >
                        <span>{r.name}</span>
                        {active && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Colore (opzionale)
                </label>
                <input
                  className="w-full border rounded-xl px-4 py-3"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  placeholder="Es. Nero"
                />
              </div>

             <div className="relative">

{loadingModels && (
  <div className="text-xs text-gray-400 mt-1">
    Caricamento modelli…
  </div>
)}

  <input
  inputMode="search"
  autoComplete="off"
  className="w-full border rounded-xl px-4 py-3 text-base"

    value={city}
    onChange={e => setCity(e.target.value)}
    onFocus={() => citySuggestions.length && setShowCityDropdown(true)}
    placeholder="Inserisci la tua città"
  />

  {showCityDropdown && citySuggestions.length > 0 && (
    <div className="absolute left-0 right-0 z-[999] bg-white border rounded-xl shadow w-full mt-1 max-h-60 overflow-auto">


      {citySuggestions.map((c, i) => (
        <button
          key={i}
          type="button"
          onClick={() => {
            setCity(c.display_name.split(',')[0]);
            setShowCityDropdown(false);
          }}
          className="w-full text-left px-4 py-3 hover:bg-gray-100"
        >
          {c.display_name}
        </button>
      ))}

    </div>
  )}


              </div>
            </div>
          )}

	{/* STEP 4 ALTRA MARCA – SOLO CITTA */}
{step === 4 && isOtherBrand && (
  <div className="space-y-6">

    <h2 className="text-lg font-semibold">
      Inserisci la tua città
    </h2>

    <div className="relative">
      <input
        inputMode="search"
        autoComplete="off"
        className="w-full border rounded-xl px-4 py-3 text-base"
        value={city}
        onChange={e => setCity(e.target.value)}
        onFocus={() => citySuggestions.length && setShowCityDropdown(true)}
        placeholder="Inserisci la tua città"
      />

      {showCityDropdown && citySuggestions.length > 0 && (
        <div className="absolute left-0 right-0 z-[999] bg-white border rounded-xl shadow w-full mt-1 max-h-60 overflow-auto">
          {citySuggestions.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setCity(c.display_name.split(',')[0]);
                setShowCityDropdown(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-100"
            >
              {c.display_name}
            </button>
          ))}
        </div>
      )}
    </div>

  </div>
)}



               {/* CTA */}
          <button
            onClick={() => {
              if (step < 4) setStep((step + 1) as 1 | 2 | 3 | 4);
              else goToFixpoints();
            }}
           disabled={
  (step === 1 && !deviceTypeId) ||
  (step === 2 && !brandId) ||
  (!isOtherBrand && step === 3 && !modelId) ||
  (!isOtherBrand && step === 4 && (repairIds.length === 0 || !city)) ||
  (isOtherBrand && step === 4 && !city)
}

           className="
w-full bg-blue-600 hover:bg-blue-700 text-white
py-3 lg:py-4
rounded-xl text-base lg:text-lg
font-semibold transition disabled:opacity-40

lg:relative
fixed lg:static bottom-0 left-0 right-0 z-30

lg:rounded-xl rounded-none
px-6
pb-[env(safe-area-inset-bottom)]



shadow-[0_-6px_20px_rgba(0,0,0,0.08)]
bg-gradient-to-r from-blue-600 to-blue-500
"



          >
            {step < 4 ? 'Continua' : 'Cerca il tuo centro'}
          </button>

        </div>
        {/* =======================
            HERO VISUAL (COLONNA DESTRA)
        ======================= */}
       <div className="hidden lg:flex justify-center items-center relative">

  <img
  src="/device-phone.png"
  alt="Dispositivo"
  className="w-[280px] lg:w-300 drop-shadow-2xl select-none pointer-events-none"

 />

</div>


      </div>
    </div>




      {/* =======================
          LANDING FIXPOINT
      ======================= */}
      <section className="relative bg-white py-24">

        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Tu chiedi, noi risolviamo.
          </h2>
          <p className="text-lg text-gray-600">
            Riparazioni rapide, sicure e trasparenti.
          </p>
        </div>
      </section>
{/* =======================
    PERCHÉ FIXPOINT + 3 MOSSE
======================= */}
<section className="bg-gradient-to-b from-white to-blue-50 py-28">
  <div className="max-w-6xl mx-auto px-6">

    {/* VANTAGGI */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
      {[
        { icon: '⏱', title: 'Riparazione in 30 minuti', color: 'bg-orange-500' },
        { icon: '€', title: 'Prezzo promo', color: 'bg-green-500' },
        { icon: '🛡', title: 'Garanzia 12 mesi', color: 'bg-blue-500' },
        { icon: '👨‍🔧', title: 'Tecnico dedicato', color: 'bg-red-500' },
      ].map((v, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-md p-6 text-center space-y-4 hover:shadow-xl transition"
        >
          <div
            className={`w-14 h-14 mx-auto rounded-xl ${v.color} text-white flex items-center justify-center text-2xl`}
          >
            {v.icon}
          </div>
          <p className="font-semibold text-gray-900">{v.title}</p>
        </div>
      ))}
    </div>

    {/* TITOLO */}
    <div className="text-center mb-16">
      <h3 className="text-4xl font-bold text-gray-900 mb-4">
        Riparato in <span className="text-green-600">3 mosse</span>
      </h3>
      <p className="text-gray-600">
        Un processo semplice, veloce e senza sorprese
      </p>
    </div>

    {/* 3 MOSSE */}
    <div className="grid md:grid-cols-3 gap-12 mb-20">
      {[
        {
          step: '1',
          icon: '🧮',
          title: 'Calcoli il preventivo',
          text: 'Inserisci il dispositivo e scopri subito il prezzo',
        },
        {
          step: '2',
          icon: '⚡',
          title: 'Prenoti la riparazione',
          text: 'Scegli il centro FixPoint più vicino a te',
        },
        {
          step: '3',
          icon: '🏪',
          title: 'Passi in negozio',
          text: 'Riparazione rapida con tecnici certificati',
        },
      ].map((s, i) => (
        <div
          key={i}
          className="bg-white rounded-3xl shadow-lg p-8 text-center relative"
        >
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
            {s.step}
          </div>

          <div className="text-5xl mb-4">{s.icon}</div>
          <h4 className="font-semibold text-xl mb-2">{s.title}</h4>
          <p className="text-gray-600 text-sm">{s.text}</p>
        </div>
      ))}
    </div>

    {/* CTA */}
    <div className="text-center">
      <a
        href="/preventivo"
        className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-lg transition"
      >
        Calcola il preventivo
      </a>
    </div>

  </div>
</section>


    </>
  );
}
