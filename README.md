# ♻️ Gestão Inteligente de Resíduos Sólidos

Este projeto é uma **ferramenta frontend para gestão e análise de resíduos sólidos**, desenvolvida para consumir e reorganizar dados do **SINIR – Sistema Nacional de Informações sobre a Gestão de Resíduos Sólidos**.

O sistema tem como principal objetivo **transformar dados brutos do SINIR em informações claras, filtráveis e consolidadas**, oferecendo visualizações e relatórios que **não estão disponíveis diretamente na plataforma oficial**.

Com ele, é possível acompanhar a geração, o armazenamento temporário e a destinação final de resíduos, segmentando os dados por tipo de resíduo e perfil de usuário.

---

## 🚀 Funcionalidades Principais

### 🗂️ Visualização e Análise de Resíduos
- Consulta de resíduos **em quantidade**.
- Separação por **tipo de resíduo**.
- Agrupamento por **perfil de usuário**:
  - Gerador  
  - Destinador  
  - Armazenador Temporário  

### 📄 Relatórios Detalhados
- Emissão de relatórios completos de **MTRs (Manifesto de Transporte de Resíduos)**.
- Consolidação de:
  - **Destinação final**
  - **Armazenamento temporário**
  - **Geração de resíduos**
- Dados apresentados de forma estruturada, facilitando análise técnica e tomada de decisão.

### 📊 Consolidação de Informações
- Integração com a base de dados do **SINIR**.
- Organização e cruzamento de informações que o sistema original não fornece de forma direta.
- Interface focada em **usabilidade e clareza dos dados**.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Finalidade |
|----------|------------|
| TypeScript | Tipagem estática e maior segurança no código |
| Vite | Build rápido e ambiente de desenvolvimento moderno |
| Frontend SPA | Interface responsiva e interativa |
| SINIR (Base de Dados) | Fonte oficial dos dados de resíduos sólidos |

---

## 📷 Capturas de Tela

![Tela de login](<./src/docs/images/Captura de tela 2025-12-24 003826.png>)


---

## ⚙️ Como Executar o Projeto

```bash
# Clone o repositório
git clone https://github.com/ricardoabicalhob/dashboard-sinir-react.git

# Acesse o diretório
cd dashboard-sinir-react

# Instale as dependências
npm install

# Execute o projeto em modo de desenvolvimento
npm run dev
