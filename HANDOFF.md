# HANDOFF: Página de Vendas

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
