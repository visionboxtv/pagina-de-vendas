# HANDOFF: Página de Vendas

## 2026-11-03: cronômetro de 3 h e avisos de compra (ramo local `cronometro-avisos`, NÃO publicado)
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
