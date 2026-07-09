import { useWizard } from './WizardContext'
import { TEMPLATE_FORMS } from './templateForms'
import DocumentPreview from './DocumentPreview'

export default function Step1Fill() {
  const {
    template,
    formData,
    updateField,
    multiData,
    updateMultiField,
    checklist,
    setChecklist,
    equipamentos,
    setEquipamentos,
    setStep,
  } = useWizard()
  const FormComponent = TEMPLATE_FORMS[template.id]

  return (
    <div className="grid-fill">
      <div className="card" style={{ padding: 16 }}>
        <div
          style={{ fontSize: 12, fontWeight: 700, marginBottom: 12, color: 'var(--texto-sec)', letterSpacing: '.04em' }}
        >
          PREENCHIMENTO
        </div>
        <div id="form-area">
          <FormComponent
            data={formData}
            checklist={checklist}
            multiData={multiData}
            equipamentos={equipamentos}
            onChange={updateField}
            onChecklistChange={setChecklist}
            onMultiChange={updateMultiField}
            onEquipamentosChange={setEquipamentos}
          />
          {template.id === 'homolog' && (
            <div className="frow">
              <label className="field-label">Link Referência</label>
              <input
                type="text"
                placeholder="Ex.: link do edital, da especificação ou do produto de referência"
                value={formData.linkReferencia ?? ''}
                onChange={(e) => updateField('linkReferencia', e.target.value)}
              />
              <div className="hint-txt">
                Use para guardar o link do edital/especificação original, para comparar com o item de referência
                preenchido neste documento.
              </div>
            </div>
          )}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--texto-sec)', letterSpacing: '.04em' }}>
          PRÉVIA DO DOCUMENTO
        </div>
        <DocumentPreview style={{ minHeight: 400 }} />
        <div className="plugin-strip">
          <div className="plugin-label">🔌 Vitae · próximos passos</div>
          <button className="action-btn" onClick={() => setStep(2)}>
            ✍ Iniciar assinaturas
          </button>
          <button
            className="action-btn"
            onClick={() => alert('No sistema real: gera o PDF do documento preenchido, sem assinaturas.')}
          >
            ⬇ Baixar rascunho
          </button>
          <button
            className="action-btn g"
            onClick={() =>
              alert('No sistema real: envia o documento por e-mail ou WhatsApp para preenchimento remoto.')
            }
          >
            ✉ Enviar para preencher
          </button>
        </div>
      </div>
    </div>
  )
}
