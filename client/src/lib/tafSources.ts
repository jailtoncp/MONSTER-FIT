export interface TafSource {
  label: string;
  url: string;
  context: string;
}

/** Editais e manuais oficiais consultados; servem como exemplos, não padrões universais. */
export const TAF_SOURCES: Record<string, TafSource[]> = {
  "abdominal-remador": [
    { label: "Senado Federal — edital de convocação do TAF, 2023", url: "https://www12.senado.leg.br/transparencia/hotsite-concurso/arquivos/edital_05_senado-edital-5-tecnico-legislativopolicial-legislativo_convocacao-taf_23032023.pdf", context: "Este edital descreve protocolo próprio de remador e contagem no tempo da prova." },
    { label: "PCES — edital de abertura, 2025", url: "https://pc.es.gov.br/Media/PCES/2025/diario_oficial_2025-10-06%20edital%20de%20abertura%20PCES.pdf", context: "Exemplo de edital com duração e critérios próprios para a execução." },
  ],
  "corrida-12-min": [
    { label: "PM de Sergipe — edital de convocação, 2025", url: "https://sead.se.gov.br/wp-content/uploads/2025/04/EDITAL-CONVOCACAO_PM_SE_OFICIAL-SAUDE-NOVO-FINAL.pdf", context: "Exemplo de corrida de 12 minutos com aferição e procedimento definidos pela banca." },
    { label: "PM do Tocantins — edital de seleção, 2016", url: "https://central3.to.gov.br/arquivo/273832/", context: "Outro edital oficial descrevendo corrida ou caminhada e registro de distância em 12 minutos." },
  ],
  "tiro-50-m": [
    { label: "PM do Tocantins — edital de seleção, 2016", url: "https://central3.to.gov.br/arquivo/273832/", context: "Exemplo de corrida de 50 m com pista aferida e marca em tempo." },
    { label: "PM da Bahia — Manual de Avaliação Física, 2024", url: "https://www.pm.ba.gov.br/wp-content/uploads/2024/04/PORTARIA-N.%C2%B0-031-CG-24-Aprova-o-Manual-de-Avaliacao-Fisica-da-PMBA-PMBA01-MT.16.001-e-da-outras-providencias.pdf", context: "Manual oficial descrevendo corrida curta e condições próprias de aplicação." },
  ],
  "barra-isometrica": [
    { label: "PM de Alagoas/Cebraspe — edital de abertura, 2018", url: "https://cdn.cebraspe.org.br/concursos/pm_al_18_soldado/arquivos/ED_1_2018_PM_AL___SOLDADO_EDITAL_DE_ABERTURA.PDF", context: "Exemplo de protocolo isométrico em posição elevada com tempo cronometrado." },
    { label: "Corpo de Bombeiros Militar de Goiás — norma NA-02, 2023", url: "https://www.bombeiros.go.gov.br/wp-content/uploads/2023/08/NA-02-julho-2023.pdf", context: "Outra norma oficial com descrição e critérios de encerramento próprios." },
  ],
  "barra-fixa": [
    { label: "PM de São Paulo — Edital DP-2/321/25, 2025", url: "https://concursos.policiamilitar.sp.gov.br/wp-content/uploads/2025/09/Edital-doesp-174-de-03SET25.pdf", context: "Exemplo de barra dinâmica com critérios de amplitude e contagem definidos neste certame." },
    { label: "PM do Espírito Santo — edital CFSD 2026", url: "https://pm.es.gov.br/Media/PMES/Concursos/CFSd2026/EDITAL%20DE%20ABERTURA%20-%20CFSD%20COMBATENTE%202026.pdf", context: "Outro edital oficial; compare suas regras apenas para a seleção correspondente." },
  ],
  "salto-horizontal": [
    { label: "Polícia Civil do Rio Grande do Sul — edital de abertura, 2025", url: "https://www.pc.rs.gov.br/upload/arquivos/202510/13082837-edital-de-abertura-04-2025-admin-f.pdf", context: "Exemplo com impulsão horizontal estacionária, medição e tentativas descritas no edital." },
    { label: "PCES — edital de abertura, 2025", url: "https://pc.es.gov.br/Media/PCES/2025/diario_oficial_2025-10-06%20edital%20de%20abertura%20PCES.pdf", context: "Segundo exemplo oficial, com seu próprio critério de medida." },
  ],
  "subida-corda": [
    { label: "CBMERJ — edital CFO, 2026", url: "https://www.cbmerj.rj.gov.br/wp-content/uploads/2025/12/Edital-CFO-2026.pdf", context: "Exemplo de prova com meta de altura e critérios próprios de subida." },
    { label: "PM do Maranhão — edital de curso especial, 2025", url: "https://pm.ssp.ma.gov.br/wp-content/plugins/download-attachments/includes/download.php?id=IRXzbFrg3_R42Cdfx3Uvew,,", context: "Outro exemplo oficial com altura e técnica definidos para o curso específico." },
  ],
  "shuttle-run": [
    { label: "Polícia Rodoviária Federal/Cebraspe — edital de abertura, 2021", url: "https://cdn.cebraspe.org.br/concursos/prf_21/arquivos/ED_1_PRF_2021_ABERTURA.PDF", context: "Exemplo oficial de percurso entre linhas, blocos e resultado cronometrado." },
    { label: "PM do Tocantins — edital de seleção, 2016", url: "https://central3.to.gov.br/arquivo/273832/", context: "Outro protocolo oficial de corrida de ir e vir com percurso e execução descritos." },
  ],
  "flexao-solo": [
    { label: "PM de São Paulo — Edital DP-2/321/25, 2025", url: "https://concursos.policiamilitar.sp.gov.br/wp-content/uploads/2025/09/Edital-doesp-174-de-03SET25.pdf", context: "Exemplo oficial de critérios próprios de posição, amplitude e repetição válida." },
    { label: "PM do Tocantins — edital de seleção, 2016", url: "https://central3.to.gov.br/arquivo/273832/", context: "Outro exemplo, com variante de execução definida por este edital." },
  ],
};
