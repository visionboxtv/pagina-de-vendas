# HANDOFF: Página de Vendas

## 2026-10-21: pasta adotada pelo Cérebro
- A pasta já existia: o Cérebro a registrou no mapa e criou só o que faltava, sem levar nada dela para o Git. Motor: claude.
- Origem: estava arquivada em `_Arquivo/sales-page` desde 2026-07-25; voltou a pedido do dono, com o nome da pasta igual ao do repositório.
- O que é: página única (`index.html`) da VisionBox, título "Assista Tudo Sem Pagar Mensalidade", com vídeo de vendas (`video/`), 4 planos ligados ao checkout da Cakto e Meta Pixel (PageView e InitiateCheckout).
- Onde fica: GitHub `visionboxtv/pagina-de-vendas` (branch `main`, em dia com o remoto) e projeto `sales-page` na Vercel. Último commit: 2026-06-18 (cronômetro do topo removido).
- Pendências da época, fora de commit: `.gitignore` com a linha `.vercel` repetida e `video/video-vsl-recuperado.mp4` sem commit (vídeo grande; decidir se entra no Git).
- Atenção: um push para o GitHub pode publicar a página pela Vercel; publicar só com a confirmação do dono.
