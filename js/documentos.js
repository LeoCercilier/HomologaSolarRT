// 1. Funções Auxiliares de Tratamento de Texto
function sanitizarTextoPDF(texto) {
  if (!texto) return '';
  return texto
    .toString()
    .replace(/&p|⚠️|❌|✔/g, '') // Remove ícones/resíduos
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

// 2. Função Principal de Geração do PDF
async function gerarMemorialPDF(dadosProjeto) {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // Tamanho A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  const margin = 40;
  const lineSpacing = 14;

  const desenharTexto = (texto, fontSize = 10, isBold = false, color = rgb(0, 0, 0)) => {
    if (y < 50) {
      page = pdfDoc.addPage([595.28, 841.89]);
      y = 800;
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
    
    // Exibe detalhadamente o Voc corrigido por temperatura e os limites
    dadosProjeto.analise.inconsistencias.forEach(item => {
      desenharTexto(`- ${item}`);
    });
  } else {
    desenharTexto("Sistema dimensionado em conformidade com os limites eletricos dos equipamentos.");
  }

  // --- Rodapé com Paginação ---
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
