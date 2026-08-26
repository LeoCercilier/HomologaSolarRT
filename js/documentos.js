// ==========================================
// 1. FUNÇÕES AUXILIARES DE FORMATAÇÃO E TEXTO
// ==========================================
function sanitizarTextoPDF(texto) {
  if (!texto) return '';
  return texto
    .toString()
    .replace(/&p|⚠️|❌|✔/g, '') // Remove artefatos de ícones
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos para compatibilidade com WinAnsiEncoding
    .trim();
}

function formatarTipoConexao(valor) {
  const mapa = {
    'monofasica': 'Monofasica',
    'bifasica': 'Bifasica',
    'trifasica': 'Trifasica'
  };
  return mapa[valor?.toLowerCase()] || valor || 'Nao informado';
}

// ==========================================
// 2. FUNÇÃO PRINCIPAL DE GERAÇÃO DO PDF
// ==========================================
async function gerarMemorialPDF(dadosProjeto) {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 780;
  const margin = 40;
  const lineSpacing = 14;

  const desenharTexto = (texto, fontSize = 10, isBold = false, color = rgb(0, 0, 0)) => {
    if (y < 60) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = 780;
    }
    const txtSanitizado = sanitizarTextoPDF(texto);
    page.drawText(txtSanitizado, {
      x: margin,
      y: y,
      size: fontSize,
      font: isBold ? fontBold : font,
      color: color
    });
    y -= lineSpacing;
  };

  const desenharTituloSecao = (titulo) => {
    y -= 6;
    desenharTexto(titulo, 11, true, rgb(0.1, 0.3, 0.6));
    y -= 2;
  };

  // --- CABEÇALHO ---
  desenharTexto("HOMOLOGASOLAR RT", 16, true, rgb(0.1, 0.3, 0.6));
  desenharTexto("MEMORIAL DESCRITIVO DE MICROGERACAO FOTOVOLTAICA", 12, true);
  desenharTexto(`Projeto: ${dadosProjeto.nomeProjeto || 'Sem nome'}`, 10, false, rgb(0.4, 0.4, 0.4));
  y -= 10;

  // --- 1. OBJETO ---
  desenharTituloSecao("1. OBJETO E OBJETIVO");
  desenharTexto("O presente Memorial Descritivo estabelece os criterios tecnicos e o dimensionamento");
  desenharTexto("eletrico para homologacao de sistema de Microgeracao Distribuida Fotovoltaica, em");
  desenharTexto("conformidade com as normas ABNT NBR 5410, NBR 16690 e requisitos da concessionaria.");

  // --- 2. IDENTIFICAÇÃO ---
  desenharTituloSecao("2. IDENTIFICACAO DO CLIENTE E RT");
  desenharTexto(`Cliente: ${dadosProjeto.cliente.nome || 'Nao informado'}`);
  desenharTexto(`CPF/CNPJ: ${dadosProjeto.cliente.cpfCnpj || 'Nao informado'}`);
  desenharTexto(`Responsavel Tecnico: ${dadosProjeto.rt.nome || 'Nao informado'}`);
  desenharTexto(`CREA/CFT: ${dadosProjeto.rt.crea || 'Nao informado'} - UF: ${dadosProjeto.rt.uf || '-'}`);

  // --- 3. ESPECIFICAÇÕES DOS EQUIPAMENTOS ---
  desenharTituloSecao("3. ESPECIFICACOES DOS EQUIPAMENTOS");
  desenharTexto(`Modulos: ${dadosProjeto.sistema.qtdModulos}x ${dadosProjeto.sistema.fabricanteModulo} ${dadosProjeto.sistema.modeloModulo} (${dadosProjeto.sistema.potenciaModulo}Wp)`);
  desenharTexto(`Potencia DC Total: ${dadosProjeto.sistema.potenciaDC} kWp`);
  desenharTexto(`Inversor: ${dadosProjeto.sistema.qtdInversor}x ${dadosProjeto.sistema.fabricanteInversor} ${dadosProjeto.sistema.modeloInversor} (${dadosProjeto.sistema.potenciaInversor}kW)`);
  desenharTexto(`Potencia AC Total: ${dadosProjeto.sistema.potenciaAC} kW`);
  desenharTexto(`Fator Overloading (DC/AC): ${dadosProjeto.sistema.ratioDcAc}`);

  // --- 4. CONFIGURAÇÃO ELÉTRICA ---
  desenharTituloSecao("4. CONFIGURACAO ELETRICA E CONEXAO");
  desenharTexto(`Tipo de Ligacao: ${formatarTipoConexao(dadosProjeto.conexao.tipoConexao)}`);
  desenharTexto(`Tensao Nominal de Conexao: ${dadosProjeto.conexao.tensaoNominal}V`);
  desenharTexto(`Arranjo: ${dadosProjeto.sistema.qtdStrings} String(s) | Vmp String: ${dadosProjeto.sistema.vmpString}V | Voc STC: ${dadosProjeto.sistema.vocString}V`);

  // --- 5. RESULTADO DA ANÁLISE TÉCNICA ---
  desenharTituloSecao("5. ANALISE TECNICA E COMPATIBILIDADE");
  
  const statusCor = dadosProjeto.analise.status === 'APROVADO' ? rgb(0, 0.5, 0) : rgb(0.8, 0, 0);
  desenharTexto(`STATUS DA VALIDACAO: ${dadosProjeto.analise.status}`, 10, true, statusCor);

  if (dadosProjeto.analise.inconsistencias && dadosProjeto.analise.inconsistencias.length > 0) {
    desenharTexto("Inconsistencias encontradas no dimensionamento:", 10, true);
    dadosProjeto.analise.inconsistencias.forEach(item => {
      desenharTexto(`- ${item}`);
    });
  } else {
    desenharTexto("Sistema dimensionado em conformidade com os limites eletricos dos equipamentos.");
  }

  // --- MOLDURA E RODAPÉ ---
  const totalPaginas = pdfDoc.getPageCount();
  pdfDoc.getPages().forEach((p, index) => {
    p.drawRectangle({
      x: 20, y: 20,
      width: 555.28, height: 801.89,
      borderWidth: 0.5,
      borderColor: rgb(0.7, 0.7, 0.7)
    });
    p.drawText(`HomologaSolar RT  |  Pagina ${index + 1} de ${totalPaginas}`, {
      x: 40, y: 28,
      size: 8,
      font: font,
      color: rgb(0.5, 0.5, 0.5)
    });
  });

  return await pdfDoc.save();
}

// ==========================================
// 3. EXECUÇÃO NO CLIQUE DO BOTÃO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const btnGerar = document.getElementById('btnGerarPDF') || document.querySelector('.btn-gerar-pdf');

  if (btnGerar) {
    btnGerar.addEventListener('click', async (e) => {
      e.preventDefault();

      try {
        // Coleta/Mapeamento dos dados do formulário/sistema
        const dadosProjeto = {
          nomeProjeto: document.getElementById('nomeProjeto')?.value || 'Teste de Homologacao',
          cliente: {
            nome: document.getElementById('clienteNome')?.value || 'Leonardo Cercilier da Cruz',
            cpfCnpj: document.getElementById('clienteCpf')?.value || ''
          },
          rt: {
            nome: document.getElementById('rtNome')?.value || '',
            crea: document.getElementById('rtCrea')?.value || '',
            uf: document.getElementById('rtUf')?.value || ''
          },
          sistema: {
            fabricanteModulo: document.getElementById('fabModulo')?.value || 'JA Solar',
            modeloModulo: document.getElementById('modModulo')?.value || 'JAM 72D30-595/GB',
            potenciaModulo: 595,
            qtdModulos: 14,
            potenciaDC: '8.33',
            fabricanteInversor: document.getElementById('fabInversor')?.value || 'GROWATT',
            modeloInversor: document.getElementById('modInversor')?.value || 'MIN 9000TL-X',
            potenciaInversor: 9,
            qtdInversor: 1,
            potenciaAC: '9.00',
            ratioDcAc: '0.926',
            qtdStrings: 1,
            vmpString: '589.54',
            vocString: '700.28'
          },
          conexao: {
            tipoConexao: document.getElementById('tipoConexao')?.value || 'monofasica',
            tensaoNominal: 220
          },
          analise: {
            status: 'ATENCAO / INCONSISTENTE',
            inconsistencias: [
              `Voc corrigido pela temp. minima (-10C): 825.46V (Excede limite max. do inversor: 600V).`,
              `Vmp da String (589.54V) esta fora da faixa MPPT do inversor (60V a 550V).`
            ]
          }
        };

        // Gera o PDF e dispara o download
        const pdfBytes = await gerarMemorialPDF(dadosProjeto);
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Memorial_Descritivo_${dadosProjeto.nomeProjeto.replace(/\s+/g, '_')}.pdf`;
        link.click();

      } catch (erro) {
        alert('Erro ao gerar o PDF: ' + erro.message);
        console.error(erro);
      }
    });
  }
});
