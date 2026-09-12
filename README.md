# 🎨 Portfolio Profissional / Sistema de Orçamentos

Este é um portfólio moderno e dinâmico desenvolvido principalmente para Designers e Desenvolvedores. 

Diferente de sites estáticos comuns, este projeto conta com um **Painel Administrativo (CMS)** integrado, permitindo a gestão completa de projetos, serviços, combos promocionais e informações de perfil sem tocar em uma linha de código, facilitando novos usuários no ramo de programação.

Além disso, possui um **Simulador de Orçamentos** inteligente que envia o pedido pronto diretamente para o WhatsApp, podendo ser substituido por um sistema de checkout (MercadoPago, Stripe ou demais).

🔗 **Projeto em tempo real:** [https://designerph.shop](https://designerph.shop)

---

## 🚀 Tecnologias Utilizadas

* **Core:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
* **Animações:** [Framer Motion](https://www.framer.com/motion/)
* **Banco de Dados:** [Firebase Firestore](https://firebase.google.com/) (NoSQL)
* **Armazenamento de Imagens:** [Cloudinary](https://cloudinary.com/) (Upload Otimizado)
* **Ícones:** [Lucide React](https://lucide.dev/)
* **Deploy:** GitHub Pages

---

## ✨ Funcionalidades Principais

### 🌐 Para o Cliente (Frontend)
* **Design Responsivo:** Layout "Mobile-First" que funciona perfeitamente em celulares e desktops.
* **Simulador de Orçamento:**
    * Seleção de serviços avulsos ou combos.
    * Cálculo automático de totais.
    * Integração com API do WhatsApp para fechar negócio.
    * Carrinho persistente (bolha flutuante).
* **Carrossel de Projetos:** Exibição aleatória e deslizante dos trabalhos recentes.
* **Galeria Lightbox:** Zoom em tela cheia para visualizar detalhes dos projetos.
* **Filtros Inteligentes:** Ao clicar em um serviço, exibe apenas os projetos vinculados a ele.

### 🔒 Painel Administrativo (Backend-less)
* **Autenticação:** Acesso protegido por senha (via variáveis de ambiente).
* **Gestão de Projetos:** Adicionar, editar e remover projetos com upload múltiplo de imagens.
* **Gestão de Serviços:** Criar serviços com preços fixos ou por quantidade/unidade.
* **Sistema de Promoções:** Criar combos com data de validade e descontos automáticos.
* **Perfil & Social:** Alterar textos, foto de perfil e links de redes sociais em tempo real.

---

## 🛠️ Como Rodar Localmente

1.  **Clone o repositório**

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto e preencha com suas chaves (veja a seção de Configuração abaixo).

4.  **Rode o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

---

## ⚙️ Configuração (.env)

Para que o Banco de Dados e o Upload de Imagens funcionem, você precisa criar um arquivo `.env` na raiz do projeto com as seguintes chaves:

```env
# Configurações do Firebase (Banco de Dados)
VITE_API_KEY=sua_api_key_do_firebase
VITE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_PROJECT_ID=seu-projeto-id
VITE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_MESSAGING_SENDER_ID=seu_sender_id
VITE_APP_ID=seu_app_id

# Configuração do Admin
VITE_ADMIN_PASSWORD=SuaSenhaSecretaAqui
```

















Desenvolvido por Pedro Henrique. Ao utilizar eu peço que referêncie o projeto.
