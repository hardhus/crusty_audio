import { useState, useEffect, useRef } from 'react';
import init, { WasmEngine } from '../pkg/crusty_audio';

const PRESETS = {
  techno: `bpm 115

sub = sine(E1).adsr(0.3, 0.05, 0.1, 0.5, 0.2).lpf(150).gain(1.2)
acid_l = saw(E2).adsr(0.15, 0.01, 0.1, 0.2, 0.1).lpf(600).gain(0.5)

kick   : 1.0  0.0  0.0  0.0   1.0  0.0  0.0  0.0   1.0  0.0  0.0  0.0   1.0  0.0  0.0  0.0
hat    : 0.6  0.2  0.8  0.3   0.6  0.2  0.8  0.3   0.6  0.2  0.8  0.3   0.6  0.5  0.9  0.4
sub    : 0.0  0.0  0.9  0.0   0.0  0.0  0.9  0.0   0.0  0.0  0.9  0.0   0.0  0.9  0.0  0.9
acid_l : 0.5  0.5  0.0  0.5   0.5  0.5  0.0  0.5   0.5  0.5  0.0  0.5   0.0  0.0  0.5  0.5`,

  ambient: `bpm 85

pad = square(329.63).adsr(2.0, 0.5, 0.5, 1.0, 1.5).lpf(300).delay(0.5, 0.7, 0.6).gain(0.2)
sub = sine(A1).adsr(1.5, 0.1, 0.2, 0.8, 1.0).lpf(120).gain(0.8)

pad    : 1.0  0.0  0.0  0.0   0.0  0.0  0.0  0.0   0.5  0.0  0.0  0.0   0.0  0.0  0.0  0.0
sub    : 1.0  0.0  0.0  0.0   0.0  0.0  0.0  0.0   1.0  0.0  0.0  0.0   0.0  0.0  0.0  0.0`,

  retro: `bpm 140

kick = kick().gain(1.0)
snare = snare().gain(0.7)
arp = sine(B4).adsr(0.1, 0.01, 0.05, 0.5, 0.1).delay(0.25, 0.4, 0.4).gain(0.5)

kick   : 1.0  0.0  0.0  0.0   0.0  0.0  1.0  0.0   1.0  0.0  0.0  0.0   0.0  0.0  1.0  0.0
snare  : 0.0  0.0  0.0  0.0   1.0  0.0  0.0  0.0   0.0  0.0  0.0  0.0   1.0  0.0  0.0  0.2
arp    : 0.4  0.0  0.6  0.0   0.8  0.0  0.5  0.0   0.4  0.0  0.9  0.0   0.6  0.0  0.8  0.0`
};

export default function App() {
  const [code, setCode] = useState(PRESETS.techno);
  const [activePreset, setActivePreset] = useState<keyof typeof PRESETS>('techno');
  const [status, setStatus] = useState('WASM Başlatılıyor...');
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const wasmEngineRef = useRef<any>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    init().then(() => {
      setStatus('Ses motoru başarıyla yüklendi. Başlatmaya hazır! 🔊');
      setIsReady(true);
    }).catch(err => {
      setStatus(`WASM Yükleme Hatası: ${err}`);
    });
  }, []);

  useEffect(() => {
    if (!isReady || !audioCtxRef.current) return;

    const timer = setTimeout(() => {
      try {
        const sampleRate = audioCtxRef.current?.sampleRate || 44100;
        wasmEngineRef.current = WasmEngine.compile_code(code, sampleRate);
        setStatus('Kod anlık olarak derlendi ve güncellendi! 🚀');
      } catch (err) {
        setStatus(`Derleme Hatası: ${err}`);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [code, isReady]);

  const togglePlayback = async () => {
    if (!audioCtxRef.current) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;

      const scriptNode = ctx.createScriptProcessor(2048, 0, 1);
      scriptNode.onaudioprocess = (e) => {
        const channelData = e.outputBuffer.getChannelData(0);
        if (wasmEngineRef.current && isPlayingRef.current) {
          wasmEngineRef.current.fill_buffer(channelData);
        } else {
          channelData.fill(0);
        }
      };
      scriptNode.connect(ctx.destination);
    }

    if (isPlaying) {
      audioCtxRef.current.suspend();
      isPlayingRef.current = false;
      setIsPlaying(false);
    } else {
      await audioCtxRef.current.resume();
      isPlayingRef.current = true;
      setIsPlaying(true);
      try {
        const sampleRate = audioCtxRef.current?.sampleRate || 44100;
        wasmEngineRef.current = WasmEngine.compile_code(code, sampleRate);
      } catch(e) {}
    }
  };

  const loadPreset = (presetName: keyof typeof PRESETS) => {
    setCode(PRESETS[presetName]);
    setActivePreset(presetName);
  };

  const handleReset = () => {
    setCode(PRESETS[activePreset]);
    setStatus('Kod orijinal haline sıfırlandı.');
  };

  return (
    <div className="flex flex-col justify-center items-center px-4 w-screen min-h-screen bg-slate-950 text-slate-100 select-none">
      <div className="flex flex-col gap-5 p-6 w-full max-w-5xl bg-slate-900 rounded-3xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent m-0">
                Crusty Live Studio
              </h1>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Tarayıcı tabanlı modüler DSP ve Canlı Müzik Script Editörü
            </p>
          </div>
          
          <button
            onClick={togglePlayback}
            disabled={!isReady}
            className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-sm tracking-wide transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-30 ${
              isPlaying 
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20' 
                : 'bg-cyan-400 hover:bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-400/20'
            }`}
          >
            {isPlaying ? '⏹️ MOTORU DURDUR' : '▶️ STÜDYOYU BAŞLAT'}
          </button>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Örnek Parçalar:</span>
            {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((p) => (
              <button
                key={p}
                onClick={() => loadPreset(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer capitalize ${
                  activePreset === p
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/30 transition-all cursor-pointer"
          >
            🔄 Değişiklikleri Sıfırla
          </button>
        </div>

        <div className="relative w-full group">
          <div className="absolute top-3 right-4 z-10 text-[10px] font-mono text-slate-600 group-focus-within:text-cyan-500/50 transition-colors uppercase tracking-widest">
            DSL Script Editor
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="w-full h-[420px] p-5 bg-slate-950 text-emerald-400 font-mono text-sm rounded-2xl border border-slate-800 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/40 transition-all resize-none leading-relaxed shadow-inner selection:bg-slate-800 selection:text-cyan-300"
          />
        </div>

        <div className={`p-3.5 rounded-xl text-xs font-mono border transition-all duration-300 ${
          status.includes('Hata') 
            ? 'bg-rose-950/30 border-rose-900/40 text-rose-400 shadow-inner' 
            : 'bg-slate-950 border-slate-800 text-cyan-400 shadow-inner'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${status.includes('Hata') ? 'bg-rose-500' : 'bg-cyan-400'}`} />
            <span className="truncate">{status}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
