use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct WasmEngine {
    sequencer: crusty_audio_engine::sequencer::Sequencer,
    sample_rate: f32,
}

#[wasm_bindgen]
impl WasmEngine {
    pub fn compile_code(source: &str, sample_rate: f32) -> Result<WasmEngine, String> {
        let sequencer = crusty_audio_lang::compile(source, sample_rate)?;
        Ok(WasmEngine {
            sequencer,
            sample_rate,
        })
    }

    pub fn fill_buffer(&mut self, buffer: &mut [f32]) {
        use crusty_audio_engine::AudioNode;
        self.sequencer.process(buffer, self.sample_rate);
    }
}
