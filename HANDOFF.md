# HANDOFF: Página de Vendas

## 2026-11-04: entrega da Cakto com link do WhatsApp nos 4 planos
- Causa da compra de teste sem entrega: os 4 produtos tinham só o canal "Link de pagamento" (nenhuma entrega). Configurado em cada produto (Configurações): canal **Acesso por e-mail** com o link `https://wa.me/5531983555608?text=Olá! Acabei de comprar o plano <Plano> da VisionBox e gostaria de instalar.` (texto codificado no link, um por plano), página de vendas `https://visionboxtv.app` e nome de exibição "VisionBox". E-mail de confirmação já estava ligado ("enviar imediatamente após o pagamento").
- Em Upsell e Downsell (página de obrigado personalizada) ligada nos 4, redirecionando para o mesmo link do WhatsApp do plano. Tudo conferido recarregando cada página.
- Número: (31) 98355-5608, "Contato Principal VisionBox", confirmado pelo dono como o suporte 1.
- Falta validar com uma compra real: se o e-mail chega (olhar spam) e se a Cakto não acrescenta parâmetros que estraguem a mensagem no redirecionamento. E-mail de suporte da Cakto continua o pessoal do dono (washington4726), não alterado.

## 2026-11-04: WhatsApp fora da página; avisos com preço do plano (PUBLICADO, e5bcbe1)
- Pedido do dono, com "pode publicar": retirados todos os links de WhatsApp para contato (botão flutuante, FAQ 07, link Contato e selo do rodapé, SAC, aviso de oferta encerrada e páginas de privacidade, termos e trocas). Contato agora só pelo e-mail pixvisionbox@gmail.com; selo virou "Suporte por e-mail". Removido o evento Contact do Pixel (não há mais link de WhatsApp). Mantidas as menções de que o acesso e o suporte pós-compra são pelo WhatsApp (planos, FAQ, termos).
- `/api/vendas` passou a mostrar o preço do plano (29,70 / 67 / 97 / 147), sem a taxa de R$ 0,99 que entra no valor pago. A compra de teste do dono (Mensal) fica nos avisos por decisão dele.
- Conferido no ar: 0 links wa.me na página e nas legais, sem botão flutuante, rodapé com e-mail, sem rolagem lateral, 4 checkouts iguais, vídeo 206, `/api/vendas` com valor 29,7.
- Entrega na Cakto: feita, ver entrada acima.
- E-mail no domínio: a Vercel (mesmo no Pro) não hospeda caixas de e-mail; precisa de serviço à parte (ImprovMX grátis para encaminhar, Zoho Mail grátis, Google Workspace pago).

## 2026-11-04: Cakto LIGADA aos avisos de compra
- Primeiro teste da Cakto deu 401: a Cakto tinha gravado uma chave própria (UUID de 36 caracteres) em vez da nossa. Chave refeita: o dono colou a mesma chave nova na Cakto e em `CAKTO_WEBHOOK_SECRET` (Vercel) e fez o redeploy.
- Conferido: `/api/venda` recusa quem não tem a chave (401) e o **Testar** da Cakto (Compra aprovada) recebeu **200 OK** (webhook 81288). O produto do teste é de exemplo, então foi ignorado: `/api/vendas` segue vazio e nenhum aviso falso aparece na página.
- A partir de agora, cada compra aprovada nos 4 planos aparece nos avisos em até 1 minuto (só primeiro nome, plano e valor), junto das 48 compras comprovadas.
- Lição: se trocar a chave, ela precisa ser igual nos dois lados, e mudança de variável na Vercel só vale depois do Redeploy. Os logs da Cakto (Ver detalhes) mostram o status de cada envio.

## 2026-11-04: chave do webhook salva; Mensal da Cakto a R$ 29,70
- Webhook "Avisos da Página de Vendas" salvo e ativo na Cakto. O dono colou a chave em `CAKTO_WEBHOOK_SECRET` na Vercel (conferida pelo tamanho, 45 caracteres) e ela foi salva.
- Redeploy e teste concluídos: ver entrada acima.
- Decisão do dono: Mensal vale **R$ 29,70**. Produto Mensal alterado na Cakto de R$ 27,90 para R$ 29,70; checkout usado pela página conferido cobrando R$ 29,70.
- Verificação do domínio na Meta: não urgente (anúncios vão ao WhatsApp e o Purchase sai do Gestor como chat); fazer quando o dono quiser.
- Páginas antigas megacinesuporte e pointplay9: o dono disse que ninguém mais usa; ficam como estão (sem visitas, não enviam compras ao Pixel).
- Nenhum arquivo do site alterado; nada publicado.

## 2026-11-04: Cakto quase ligada aos avisos; Meta sem mudanças
- Feito pelo Claude no navegador: banco Upstash Redis gratuito `pagina-vendas-avisos` criado e ligado ao projeto `sales-page` (variáveis `KV_REST_API_URL`/`KV_REST_API_TOKEN`). Webhook "Avisos da Página de Vendas" preenchido na Cakto (4 produtos VisionBox, evento Compra aprovada, URL https://visionboxtv.app/api/venda), **ainda não salvo**.
- Falta o dono colar a chave secreta (já copiada) no webhook da Cakto e em `CAKTO_WEBHOOK_SECRET` na Vercel; depois, republicar (redeploy) e testar com o envio de teste da Cakto. Conferido na sincronização: `/api/venda` ainda responde 503 "não configurado" e `/api/vendas` lista vazia; os 48 avisos históricos funcionam sem isso.
- Dúvida do dono respondida: a ligação com a Cakto é opcional e só alimenta os avisos da página. O Purchase continua indo pelo Gestor (Clic CRM, action_source chat); domínio novo não muda anúncios, Pixel nem otimização. Não ativar o Pixel próprio da Cakto (contaria a venda duas vezes).
- Preço divergente: produto Mensal na Cakto R$ 27,90; página mostra R$ 29,70. Aguarda decisão do dono.
- Recomendado, com ok do dono: verificar o domínio visionboxtv.app no Gerenciador de Negócios (TXT na Vercel). Páginas antigas megacinesuporte e pointplay9 ainda mandam compras pelo navegador ao mesmo Pixel (possível contagem dupla).
- Nenhum arquivo do site alterado; nada publicado.

## 2026-11-04: domínio próprio visionboxtv.app ligado
- Pedido do dono ("Use o claude para configurar o domínio"), feito pelo Claude no painel da Vercel (time PagAuto 1, plano Pro). Domínio comprado pelo dono na própria Vercel (vence em 2027-11-04), então o DNS já é da Vercel.
- Projeto `sales-page`: `visionboxtv.app` como endereço principal (Production) e `www.visionboxtv.app` com redirecionamento permanente 308 para ele. `sales-page-khaki.vercel.app` continua funcionando.
- Verificado de fora: https://visionboxtv.app responde 200 com HTTPS válido e o mesmo título da página; www responde 308 para https://visionboxtv.app/.
- O código não tem o endereço antigo fixo. Ao cadastrar o webhook da Cakto, usar https://visionboxtv.app/api/venda.

## 2026-11-04: sincronização final conferida
- Os dois pedidos foram reunidos no commit `3ae1e6d`: 48 compras comprovadas, 12 por plano, com primeiro nome, plano e valor pago no mesmo card. Esse commit já está na `main` remota e publicado; nenhuma nova publicação foi feita nesta sincronização.
- Conferência independente: HTML, `avisos.js`, base histórica, CSS e privacidade do site iguais aos arquivos locais, normalizando CRLF/LF. Base com 48 primeiros nomes distintos, 12 registros de cada modalidade e valores positivos; auditoria local contém os 48 registros de origem.
- Verificação da execução: percorreu as 48 compras com os valores em reais, prioridade de nova venda, não repetição do evento, pausas em aba oculta/modal e intervalos de 45 a 83 s. API pública respondeu 200; HANDOFF e script de simulação continuam 404. Capturas da publicação em celular e computador revisadas.
- Sem conflitos ou alterações de produto necessárias. Corrigido abaixo o registro intermediário que ainda descrevia o complemento de valores como não integrado. Mantido o vídeo local não versionado.
- Pendente: ativação externa da Cakto/Upstash/segredo na Vercel para receber novas vendas automaticamente. O histórico publicado funciona sem essa conexão; ela não foi configurada nesta sincronização.

## 2026-11-04: 48 compras comprovadas nos avisos da página
- Autorização do dono: selecionar e publicar 48 compras reais da base, 12 de cada modalidade, embaralhadas, com card minimalista, sem horários. Complemento paralelo do dono para mostrar valores foi integrado nesta entrega.
- Fonte: planilhas de clientes e pagamentos das contas Vision Box 1 e Vision Box 2, exportadas em 2026-08-23 na pasta sensível do Clic CRM. Pagamentos associados ao cliente pela coluna `usuario`; selecionados 48 primeiros nomes distintos, com data válida e valor positivo, 12 mensais, 12 trimestrais, 12 semestrais e 12 anuais. Modalidade e valor vêm do pagamento original, não do cadastro atual nem do preço da página.
- Dados públicos mínimos em `lib/compras-historicas.mjs`: primeiro nome, modalidade e valor pago. Comprovantes de linhas de origem e hashes dos quatro arquivos ficam apenas no arquivo temporário local `pag-compras-historicas-auditoria.json`, fora do Git. Nenhuma planilha, login, telefone, sobrenome, identificador de cliente ou segredo foi incluído.
- `avisos.js`: uma notificação por vez, por 7 s, primeiro aviso e seguintes em intervalos aleatórios entre 45 e 83 s. Histórico embaralhado a cada ciclo, alternando modalidades quando possível; consulta `/api/vendas` a cada minuto, prioriza eventos novos e não repete o mesmo evento. Pausa em aba oculta ou modal aberto; botão para fechar. Texto sem data, horário ou alegação de compra recente.
- Novas vendas: integração existente com a Cakto foi preservada, incluindo valor efetivamente pago. A API agora fornece um identificador derivado por hash para evitar repetições, sem revelar o identificador do pedido. A ativação externa (Upstash, segredo e webhook Cakto) segue pendente; o histórico funciona independentemente disso.
- Verificação: 48 registros, primeiros nomes distintos, 12 por modalidade, pagamento positivo e data passada; webhook/API com banco simulado, rejeição de origem inválida, valor correto e deduplicação; navegador percorreu as 48 compras e uma nova venda, validou 45–83 s, prioridade, não repetição, pausa e fechamento. Capturas inspecionadas em 390/1440 px e encaixe também em 320 px; sem erros de JavaScript. Teste simulado continua só em localhost com rótulo teste.

## 2026-11-04: rodapé atualizado com selos de confiança
- Washington autorizou a publicação com "Pode publicar"; alteração feita pelo Codex. Retirados os dois avisos indicados na imagem (não afiliação e crédito visível da foto).
- No lugar, três selos com ícones: Checkout Cakto (leva aos planos), Garantia de 7 dias (abre a política de trocas) e Suporte pelo WhatsApp (contato existente). PIX, Visa, Mastercard e PicPay ganharam fundo claro; sem certificações externas inventadas.
- Conferência local no Chrome: capturas inspecionadas em 390 e 1440 px; três selos e quatro formas de pagamento, sem rolagem lateral em 320, 390, 768 e 1440 px. Comparação automática confirmou que todo o HTML fora do rodapé ficou igual, incluindo vídeo, preços, checkouts e Pixel.
- Fonte da foto preservada neste registro: Alex Munsell, https://commons.wikimedia.org/wiki/File:Bowl_of_Popcorn_(Unsplash).jpg . A ficha consultada nesta data identifica CC0 1.0; imagem `img/pipoca.jpg` mantida.

## 2026-11-04: ajustes do dono publicados (commit cc35739)
- Topo: frase trocada para "A mesma estrutura da Sky e da Netflix."; benefícios: "Mais de 140 mil filmes, séries e canais ao vivo" (juntou dois itens) e "Sem cobrança surpresa"; bolinhas dos benefícios do topo em verde; nota do vídeo: "Clique para reproduzir o vídeo".
- Imagens do dono (convertidas para JPG leve): servidores no lugar da TV com futebol em "Por que não trava" (no celular é a primeira imagem da página; no computador a pipoca atrás do vídeo continua), showroom VisionBox em "Compatível com todos os dispositivos", arte das 2 telas no Bônus 1 (clicável, leva aos planos). Removidas futebol, celular e família; crédito no rodapé só da pipoca.
- Item 06 "140.000+ Conteúdos" removido dos diferenciais.
- Ainda citam o YouTube: o subtítulo e o item 01 de "Por que não trava" (o dono pediu a troca só no topo).
- Conferido no ar: textos novos, imagens e vídeo com 200, 4 links da Cakto e Pixel iguais, sem rolagem lateral em 390 e 1440 px, sloplint 0 FAIL.

## 2026-11-04: VSL V4 publicada
- O dono enviou a VSL V4 (Área de Trabalho, 1080x1920, 5:15, 335 MB) para aplicar na página. Convertida para `video/vsl-v4.mp4` (720x1280, H.264 CRF 28, AAC 96k, início rápido; 44 MB) e capa `video/poster-v4.jpg` (quadro de 3 s). O vídeo antigo `video/vsl.mp4` continua no repositório, sem uso.
- Publicado (commit `9e5b922`) e conferido no ar: HTML com a V4, vídeo e capa respondendo 200, os 4 links da Cakto e o Pixel iguais. No celular o vídeo segue inteiro na primeira tela (390x844 e 375x667). O botão continua liberando aos 60 s; a V4 pede o clique no fim (cerca de 5:00).
- Avisos reais: a configuração na Vercel (Upstash Redis e CAKTO_WEBHOOK_SECRET) e o webhook na Cakto seguem pendentes; o controle do navegador foi bloqueado pela permissão do modo automático do Claude Code em 2026-11-04. /api/vendas responde lista vazia.

## 2026-11-03: cronômetro e botão de 60 s PUBLICADOS pelo Codex
- Autorização do dono: "Use o Codex para aplicar e publicar tudo". Integrado `cronometro-avisos` à `main` e enviado até `122ea65`; a pasta voltou à `main`.
- Conferido em https://sales-page-khaki.vercel.app: HTML idêntico ao local (normalizando CRLF/LF; SHA-256 `72eb17c3489b50878fd3426ae8a25b87ba647f11102d80e8b5dcafddce2092f0`), CSS e privacidade idênticos; vídeo responde 206; páginas legais acessíveis. Links dos quatro checkouts e Pixel preservados.
- Ativos: cronômetro de 3 h + 5 a 25 min persistente, aviso de 10 min ao zerar, encerramento da oferta daquele navegador e botão com 60 s de vídeo. Cronômetro de bônus de 15 min mantido. Persistência depende do armazenamento do navegador; não impede abrir outro navegador ou acessar um link de checkout já conhecido.
- API de avisos reais publicada, mas NÃO ativada: `/api/vendas` retorna 200 com lista vazia; POST `/api/venda` retorna 503 "não configurado". Falta conectar Upstash Redis, definir `CAKTO_WEBHOOK_SECRET` na Vercel e cadastrar o webhook `purchase_approved` dos quatro planos na Cakto. Não há credenciais da CLI Vercel nem acesso ao navegador nesta sessão (host indisponível); configuração externa não foi alterada.
- Revisão da API: apenas ofertas conhecidas, pagamento aprovado e data real nas últimas 48 h; deduplicação atômica por pedido; suporte a webhook V1/V2; falhas do banco e assinaturas incompletas tratadas. Política de privacidade identifica o Upstash.
- Verificações locais com banco simulado: origem falsa, assinatura HMAC, retentativas, outros produtos, vendas antigas/não pagas, V2, minimização de dados e falha do banco; lógica do prazo, recarga, aviso, encerramento e botão 59/60 s. Sem teste de venda real ou nova inspeção visual por navegador nesta sessão.
- Simulação continua apenas local. `/teste/avisos-simulados.js` e `/HANDOFF.md` respondem 404 no site. Fotos provisórias mantidas; preço efetivamente cobrado na Cakto ainda não conferido.

## 2026-11-03: preparação do cronômetro e dos avisos (histórico; publicação acima)
- Cronômetro no topo: 3 h + 5 a 25 min por visitante, gravado no navegador (recarregar não reinicia). Ao zerar com a pessoa na página, abre o aviso "Esta oferta sai do ar para você em 10:00"; passados os 10 min, os planos e o botão final somem neste acesso e aparece o contato do WhatsApp. O cronômetro de 15 min dos bônus continua igual.
- Botão do topo liberado com 60 s de vídeo (antes 90 s).
- Avisos de compra só com vendas reais: `api/venda.mjs` recebe o webhook da Cakto (purchase_approved, valida o secret ou a assinatura HMAC) e guarda só primeiro nome e plano no Upstash Redis; `api/vendas.mjs` entrega as das últimas 48 h. Sem configuração, nada aparece. Testado com Redis falso local.
- Falta para funcionar no ar: criar o Upstash Redis na Vercel (projeto sales-page), definir CAKTO_WEBHOOK_SECRET e cadastrar na Cakto o webhook https://sales-page-khaki.vercel.app/api/venda com o evento purchase_approved.
- Aviso simulado: só em teste/avisos-simulados.js (fora do Git e do site), carregado apenas em arquivo local ou localhost com ?teste-avisos no endereço, com o rótulo "teste". O dono pediu que ele não vá ao ar.
- Política de privacidade ganhou o item dos avisos (primeiro nome e plano).

## 2026-11-03: novo visual (versão A) PUBLICADO
- Publicado com o "sim" do dono ("Pode publicar sim"): push de `main` até `9a92d9a`. Conferido no ar: HTML idêntico à `main`, os 4 links da Cakto, pixel, páginas legais, vídeo, `versao-a.css` e as fotos de `img/` respondendo.
- Fora desta publicação: cronômetro de 3 h no topo e avisos de compra (pedido em andamento em outro chat). O aviso simulado é só para teste do dono e não deve ir ao ar.
- O dono escolheu a versão A entre duas propostas (commits `67f8246` e `f020b50`).
- Visual: fundo que alterna escuro e claro ao rolar, nomes dos streamings correndo de lado, blocos que entram ao rolar, mockups de TV e celular, FAQ em painéis numerados, sem emojis. Estilo em `versao-a.css`; fotos em `img/` (Wikimedia Commons, créditos no rodapé). O dono avisou que as imagens vão mudar.
- Topo: frase abaixo do título encurtada para "A mesma estrutura do YouTube e da Netflix: sinal estável, sem travar." No celular, o vídeo aparece inteiro na primeira tela (conferido em 390x844, 360x740 e 375x667).
- Botão "QUERO ACESSAR AGORA" abaixo do vídeo: aparece depois de 90 s de vídeo assistido ou no fim (`LIBERAR_EM` no script) e leva aos planos (#planos). Quem já liberou vê direto (localStorage).
- Conferido contra a versão anterior: links da Cakto, WhatsApp e páginas legais, os 20 valores em R$, pixel e scripts iguais; sloplint da Hallmark com 0 FAIL; sem rolagem lateral em 320, 390 e 1440 px.
- Hallmark instalada só no projeto (`.claude/skills/hallmark`, fora do Git). Ramos locais de comparação: `visual-hallmark` (reprovado), `pag-versao-a`, `pag-versao-b`.

## 2026-11-03: ajustes publicados com autorização do dono
- Publicado o commit `a415f0b` em `main`, após a confirmação "alterar e publicar no site". Site: https://sales-page-khaki.vercel.app.
- Mensal anunciado no HTML: R$29,70. Mantidos trimestral R$67, semestral R$97 e anual R$147, com os mesmos links da Cakto.
- Economia destacada contra o novo mensal: R$22,10 em 3 meses, R$81,20 em 6 meses e R$209,40 em 12 meses (anual cerca de 59% menor; equivalente a R$12,25/mês). Botões dos cartões alinhados no computador.
- Textos, FAQ, depoimento e ilustração passaram a informar somente 2 telas, sem terceira tela de bônus. As referências textuais a OTT+ foram substituídas por "Estrutura própria em On Demand e CDN".
- Verificação: links preservados, contas conferidas e visual inspecionado em 1440px e 390px, sem rolagem lateral nessas larguras. Em 320px, há transbordamento anterior nos cartões de benefícios; não foi ampliado no comparativo local com fontes padrão, nem corrigido neste escopo.
- Produção respondeu HTTP 200 e entregou HTML idêntico ao arquivo publicado (normalizando CRLF/LF; SHA-256 `f5f531300694d8667d9d3d533be6233b34ce5464143ebc871018d31ada3e1188`).
- Limite: o vídeo e o checkout externo da Cakto não foram alterados. O valor efetivamente cobrado no checkout não foi confirmado nesta entrega.

## 2026-10-21: pasta adotada pelo Cérebro
- A pasta já existia: o Cérebro a registrou no mapa e criou só o que faltava, sem levar nada dela para o Git. Motor: claude.
- Origem: estava arquivada em `_Arquivo/sales-page` desde 2026-07-25; voltou a pedido do dono, com o nome da pasta igual ao do repositório.
- O que é: página única (`index.html`) da VisionBox, título "Assista Tudo Sem Pagar Mensalidade", com vídeo de vendas (`video/`), 4 planos ligados ao checkout da Cakto e Meta Pixel (PageView e InitiateCheckout).
- Onde fica: GitHub `visionboxtv/pagina-de-vendas` (branch `main`, em dia com o remoto) e projeto `sales-page` na Vercel. Último commit: 2026-06-18 (cronômetro do topo removido).
- Pendências da época, fora de commit: `.gitignore` com a linha `.vercel` repetida e `video/video-vsl-recuperado.mp4` sem commit (vídeo grande; decidir se entra no Git).
- Atenção: um push para o GitHub pode publicar a página pela Vercel; publicar só com a confirmação do dono.

## 2026-10-21: diagnóstico (nada publicado)
- No ar: https://sales-page-khaki.vercel.app (endereço provisório da Vercel, sem domínio próprio), igual byte a byte ao `index.html` local; vídeo responde. Último deploy de produção: 2026-06-18 (commit d161945).
- Checkouts da Cakto ativos, nomes e preços batem com a página: Mensal R$ 27,90, Trimestral R$ 67, Semestral R$ 97, Anual R$ 147 (+ R$ 0,99 de taxa). Formas: PIX, cartão e PicPay. Os termos do checkout mostram o e-mail pessoal do dono.
- Pixel 665915886273131: o mesmo dataset da API de Conversões do CRM (PageView e InitiateCheckout aqui; a compra vem do CRM).
- O repositório no GitHub é público.
- Pendências encontradas:
  - Texto contraditório: o FAQ fala em 2, 3, 4 ou 6 telas e todos os planos dizem 3; o FAQ e o rodapé citam boleto e desconto no PIX, que o checkout não tem; o FAQ promete chat ao vivo.
  - "Suporte via WhatsApp" sem nenhum link ou número de WhatsApp na página.
  - Links do rodapé (Privacidade, Termos, Trocas, Dúvidas, Contato) não levam a lugar nenhum (`#`).
  - Rodapé com © 2025.
  - Contador "pessoas assistindo agora" sorteado e cronômetro que reinicia; logos e nomes de Netflix, Globo etc.; números de clientes e avaliações sem fonte: risco de reprovação dos anúncios no Meta e de reclamação de consumidor.
  - `video/video-vsl-recuperado.mp4` é cópia idêntica de `video/vsl.mp4` (pode ser apagada sem perda); `.gitignore` com `.vercel` repetido.

## 2026-10-21: correções (no computador, sem publicar)
- Dados do dono: WhatsApp de suporte +55 31 98256-5683; e-mail pixvisionbox@gmail.com; todos os planos com 2 telas (a 3ª é o Bônus 1); cartão "com parcelamento", sem citar juros nem número de parcelas; termos genéricos em nome de "VisionBox".
- Feito: planos com 2 telas e "Até 3 telas" no topo e nos benefícios; FAQ sem as contradições (telas, boleto, desconto no PIX, 12x, chat ao vivo); botão flutuante de WhatsApp e links de contato (evento `Contact` no Pixel); rodapé com links reais, sem boleto, © 2026; novas páginas `privacidade.html`, `termos.html` e `trocas.html` (estilo em `legal.css`); a linha repetida do `.gitignore` saiu.
- Conferido localmente: links e textos, celular sem rolagem lateral.
- Mantido por decisão do dono (não mexer): contador de pessoas assistindo, cronômetro dos bônus, nomes de streamings, números e depoimentos, bônus do sorteio e a cópia do vídeo.
- Os termos dizem que os planos não se renovam sozinhos (o checkout é "à vista"); confirmar com o dono antes de publicar.
- Falta: publicar (push para o GitHub publica na Vercel), só com a confirmação do dono.

## 2026-10-21: publicada
- O dono autorizou ("Pode publicar a página de vendas corrigida."); push de 3 commits até 11399cd em `main`. Registro sensível S-20261021-003 no Cérebro.
- A frase dos termos sobre os planos não se renovarem sozinhos foi publicada sem confirmação explícita do dono; rever se algum plano virar assinatura.
# 2026-11-04 — complemento de valores (histórico; integrado e publicado em 3ae1e6d)

- Pedido mais recente do dono: mostrar também o valor do plano no card. A implementação final em `avisos.js`, carregada pelo `index.html`, acrescenta `por R$ ...` quando o registro contém `valor` numérico positivo, formatado em reais. Não substitui valor ausente pelo preço atual.
- `api/venda.mjs` guarda o `data.amount` da compra aprovada como `valor`; `api/vendas.mjs` entrega esse campo quando válido. Política de privacidade atualizada para incluir o valor.
- O complemento foi inicialmente entregue sem commit separado por haver outro agente ativo. Depois, os valores reais das 48 compras e a integração foram reunidos e publicados no commit `3ae1e6d`; não há pendência de integração ou publicação deste complemento.
- Verificado localmente: webhook e API com Redis simulado, texto em reais e omissao de valores ausentes/invalidos; sintaxe dos modulos e diff conferidos.

#
