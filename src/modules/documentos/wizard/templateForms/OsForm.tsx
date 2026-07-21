import type { TemplateFormProps } from './types'

/**
 * Nunca é de fato renderizado — a Ordem de Serviço é gerada automaticamente a partir de um chamado
 * (ver OsAssinaturaView, em Assistência) e pula direto para a assinatura. Este stub existe só para
 * satisfazer o registro TEMPLATE_FORMS (Record<TemplateId, ...>), caso o template seja alcançado por
 * engano fora desse fluxo.
 */
export default function OsForm(_props: TemplateFormProps) {
  return (
    <div className="hint-txt">
      A Ordem de Serviço é gerada automaticamente a partir de um chamado da Assistência — não há
      campos para preencher aqui.
    </div>
  )
}
