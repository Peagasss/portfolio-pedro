import React, { useState, useEffect, useRef } from 'react';
import { 
  Facebook, Twitter, Instagram, ArrowRight, X, ExternalLink, 
  Layers, Smartphone, PenTool, Mail, MapPin, Plus, Trash2, 
  Edit2, Save, Lock, LogOut, User, Grid, Briefcase, Layout, Globe,
  Linkedin, Github, Dribbble, MessageCircle, Loader, Calculator, 
  CheckCircle, ChevronLeft, ChevronRight, Minus, Clock, FileText, Monitor,
  Code, Palette, FileCheck, UserCog, Package, Share2, Tag, Calendar, UserCircle, Maximize2, Percent, ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db as firestoreDB } from "./firebaseConfig"; 

// --- CONFIGURAÇÃO ---
const CLOUDINARY_CLOUD_NAME = "drq7g7jdt"; 
const CLOUDINARY_UPLOAD_PRESET = "portfolio_upload";

const optimizeImage = (url, width = 800) => {
  if (!url) return "";
  if (!url.includes("cloudinary.com")) return url; 
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
};

const SOCIAL_PLATFORMS = {
  whatsapp: { icon: MessageCircle, label: "WhatsApp", placeholder: "Apenas números (ex: 5587999999999)", type: "number" },
  email: { icon: Mail, label: "E-mail", placeholder: "exemplo@email.com", type: "email" },
  instagram: { icon: Instagram, label: "Instagram", placeholder: "Link do perfil ou @usuario", type: "text" },
  linkedin: { icon: Linkedin, label: "LinkedIn", placeholder: "Link do perfil", type: "url" },
  behance: { icon: Layout, label: "Behance", placeholder: "Link do perfil", type: "url" },
  workana: { icon: Briefcase, label: "Workana", placeholder: "Link do perfil", type: "url" },
  github: { icon: Github, label: "GitHub", placeholder: "Link do perfil", type: "url" },
  site: { icon: Globe, label: "Outro Site", placeholder: "Link completo (https://...)", type: "url" }
};

const getSocialLink = (platform, value) => {
  if (!value) return "#";
  if (platform === 'whatsapp') return `https://wa.me/${value.replace(/\D/g, "")}`;
  if (platform === 'email') return `mailto:${value}`;
  if (value.startsWith('http')) return value;
  if (platform === 'instagram') return `https://instagram.com/${value.replace('@', '')}`;
  return `https://${value}`;
};

const SERVICE_ICONS = {
  Palette: Palette, Layout: Layout, Code: Code, FileText: FileText,
  Share2: Share2, FileCheck: FileCheck, UserCog: UserCog, Package: Package,
  Layers: Layers, Smartphone: Smartphone, Monitor: Monitor, Grid: Grid
};

const INITIAL_DB = {
  profile: {
    name: "PEDRO HENRIQUE",
    role: "SOLUÇÕES DIGITAIS",
    email: "contato@designerph.shop",
    phone: "5587999999999",
    bioTitle: "DESIGN, CÓDIGO E ESTRATÉGIA.",
    bioText: "Transformo ideias em negócios digitais.",
    aboutText: "Olá! Sou Pedro...",
    aboutImage: ""
  },
  socials: [],
  services: [],
  combos: [], 
  projects: []
};

// --- HELPER DE PREÇO ---
const getFinalPrice = (item) => {
  const original = Number(item.price);
  if (!item.discountPercent || item.discountPercent <= 0) return original;
  return original - (original * (item.discountPercent / 100));
};

const isComboActive = (combo) => {
  if (!combo) return false;
  const now = new Date();
  const start = new Date(combo.startDate);
  const end = new Date(combo.endDate);
  if (combo.isIndefinite) return true; 
  if (now >= start && now <= end) return true; 
  return false;
};

// --- COMPONENTES VISUAIS ---

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-white/10 rounded ${className}`}></div>
);

const Navbar = ({ profile, onNavigate, currentView, isLoading, activeSection, onOpenBudget }) => {
  
  // Função Inteligente de Scroll
  const scrollToSection = (sectionId) => {
    // Se não estiver na home, navega para home primeiro
    if (currentView !== 'home') {
      onNavigate('home');
      // Espera um pouquinho para o React renderizar a Home e depois rola
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      // Se já estiver na home, só rola
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getLinkClass = (sectionName) => {
    const baseClass = "hover:text-white transition-all duration-300 px-3 py-1 rounded cursor-pointer";
    if (currentView === 'home' && activeSection === sectionName) {
      return `${baseClass} text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] font-bold`; 
    }
    return `${baseClass} text-gray-400`;
  };

  return (
    <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-8 py-6 z-40 bg-[#121214]/90 backdrop-blur-md border-b border-white/5 transition-all">
      <div className="flex flex-col leading-none select-none cursor-pointer" onClick={() => scrollToSection('home')}>
        {isLoading ? <Skeleton className="h-6 w-32 mb-1"/> : <span className="font-black text-xl text-white tracking-tighter">{profile.name}</span>}
        {isLoading ? <Skeleton className="h-3 w-20"/> : <span className="text-[10px] text-purple-400 font-bold tracking-[0.3em] mt-1 uppercase">{profile.role}</span>}
      </div>
      <div className="hidden md:flex items-center gap-4 text-xs font-bold tracking-widest">
        <button onClick={() => scrollToSection('home')} className={getLinkClass('home')}>INÍCIO</button>
        <button onClick={() => scrollToSection('projects')} className={getLinkClass('projects')}>TRABALHOS</button>
        <button onClick={() => scrollToSection('services')} className={getLinkClass('services')}>SERVIÇOS</button>
        <button onClick={() => scrollToSection('about')} className={getLinkClass('about')}>SOBRE</button>
        
        <button 
          onClick={onOpenBudget} 
          className="relative group bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2 rounded-full shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.6)] hover:scale-105 transition-all duration-300 animate-pulse-slow ml-2"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Calculator size={14} /> ORÇAMENTO
          </span>
        </button>
      </div>
    </nav>
  );
};

// --- BOLHA FLUTUANTE (CARRINHO) ---
const BudgetBubble = ({ itemCount, total, onClick }) => {
  return (
    <motion.div 
      initial={{ scale: 0, opacity: 0 }} 
      animate={{ scale: 1, opacity: 1 }} 
      exit={{ scale: 0, opacity: 0 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-[0_0_30px_rgba(147,51,234,0.6)] cursor-pointer hover:scale-110 transition-transform flex items-center gap-3 pr-6 group"
    >
      <div className="relative">
        <Calculator size={24} />
        <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#121214] font-bold">
          {itemCount}
        </span>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Continuar</span>
        <span className="text-sm font-black">R$ {total}</span>
      </div>
    </motion.div>
  );
};

// --- MODAL DE CONTATO ---
const ContactModal = ({ socials, onClose }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={onClose}>
      <motion.div initial={{ y: 50, scale: 0.9 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.9 }} className="bg-[#1e1e24] w-full max-w-4xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 z-10"><X size={20} /></button>
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-purple-900/20 flex flex-col justify-center">
            <h2 className="text-3xl font-black mb-6 text-white">VAMOS CONVERSAR?</h2>
            <p className="text-gray-300 text-sm mb-8">Estou disponível para novos projetos. Escolha seu canal preferido:</p>
            <div className="space-y-4">
              {socials.map((social) => (
                <a key={social.id} href={getSocialLink(social.platform, social.url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="p-3 bg-black/30 rounded-lg group-hover:bg-purple-600 transition-colors shadow-md">{React.createElement(SOCIAL_PLATFORMS[social.platform]?.icon || Globe, { className: "text-white", size: 20 })}</div>
                  <div><p className="text-xs text-gray-400 font-bold uppercase group-hover:text-purple-300 transition-colors">{SOCIAL_PLATFORMS[social.platform]?.label}</p><p className="text-white font-bold">{social.label}</p></div>
                </a>
              ))}
            </div>
        </div>
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-[#121214]">
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Envie um e-mail direto</h4>
          <form className="space-y-4">
            <input type="text" className="w-full bg-[#1e1e24] rounded-lg p-3 text-white outline-none focus:ring-1 focus:ring-purple-500 border border-white/5" placeholder="Seu Nome" />
            <input type="email" className="w-full bg-[#1e1e24] rounded-lg p-3 text-white outline-none focus:ring-1 focus:ring-purple-500 border border-white/5" placeholder="Seu Email" />
            <textarea rows="4" className="w-full bg-[#1e1e24] rounded-lg p-3 text-white outline-none resize-none focus:ring-1 focus:ring-purple-500 border border-white/5" placeholder="Como posso ajudar?"></textarea>
            <button className="w-full py-4 bg-purple-600 font-bold rounded-lg text-xs tracking-widest hover:bg-purple-500 transition-all text-white mt-2">ENVIAR MENSAGEM</button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- ORÇAMENTO COMO MODAL ---
const BudgetModal = ({ db, quantities, updateQuantity, handleCardClick, total, handleSendWhatsapp, onClose }) => {
  const activeCombos = (db.combos || []).filter(isComboActive).map(c => ({
    ...c, id: `combo_${c.id}`, isCombo: true, icon: 'Package', text: c.description || "Pacote Especial"
  }));

  const services = db.services;
  const combos = activeCombos;
  const hasItems = total > 0; 

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-black/95 backdrop-blur-md overflow-hidden flex flex-col">
      <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#121214]">
         <div>
            <h2 className="text-2xl md:text-3xl font-black text-white">SIMULADOR <span className="text-purple-500">DE PROJETO</span></h2>
            <p className="text-xs text-gray-500">Selecione o que precisa. Os combos promocionais estão no final da lista.</p>
         </div>
         <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20"><X size={24}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-12 pb-24">
            <div className="mb-10">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-widest"><Layers size={16} className="text-purple-500"/> Serviços Individuais</h3>
              <div className="grid md:grid-cols-2 gap-4">
                 {services.map(item => {
                    const qty = quantities[item.id] || 0;
                    const isSelected = qty > 0;
                    const Icon = SERVICE_ICONS[item.icon] || Layers;
                    const hasDiscount = item.discountPercent > 0;
                    const finalPrice = getFinalPrice(item);

                    return (
                      <div key={item.id} onClick={() => handleCardClick(item.id, item.isQuantity)} className={`relative flex items-center p-4 rounded-xl border transition-all duration-200 cursor-pointer ${isSelected ? 'border-purple-500 bg-[#1e1e24]' : 'border-white/5 bg-[#1e1e24]/30 hover:bg-[#1e1e24]'}`}>
                        {hasDiscount && <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">-{item.discountPercent}%</div>}
                        <div className={`p-3 rounded-lg mr-4 ${isSelected ? 'bg-purple-500 text-white' : 'bg-black/30 text-gray-500'}`}><Icon size={20}/></div>
                        <div className="flex-1">
                           <h4 className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-gray-300'}`}>{item.title}</h4>
                           <div className="flex items-center gap-2">
                              {hasDiscount && <span className="text-xs text-gray-500 line-through">R$ {item.price}</span>}
                              <p className={`text-xs ${hasDiscount ? 'text-green-400 font-bold' : 'text-gray-500'}`}>R$ {finalPrice} {item.unit ? `/ ${item.unit}` : ''}</p>
                           </div>
                        </div>
                        {isSelected && item.isQuantity ? (
                           <div className="flex items-center bg-black/40 rounded-lg p-1 border border-white/10" onClick={(e) => e.stopPropagation()}>
                              <button onClick={(e) => updateQuantity(item.id, -1, false, e)} className="p-1 hover:text-white text-gray-500"><Minus size={14}/></button>
                              <span className="w-6 text-center font-mono text-sm font-bold text-white">{qty}</span>
                              <button onClick={(e) => updateQuantity(item.id, 1, false, e)} className="p-1 hover:text-white text-purple-400"><Plus size={14}/></button>
                           </div>
                        ) : (
                           <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-600'}`}>{isSelected && <CheckCircle size={12} className="text-white"/>}</div>
                        )}
                      </div>
                    );
                 })}
              </div>
            </div>

            {combos.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-yellow-500 mb-4 flex items-center gap-2 uppercase tracking-widest border-t border-white/10 pt-8"><Package size={16}/> Combos Promocionais (Economize Agora)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {combos.map(item => {
                    const isSelected = (quantities[item.id] || 0) > 0;
                    return (
                       <div key={item.id} onClick={() => handleCardClick(item.id, false)} className={`relative flex items-center p-4 rounded-xl border transition-all duration-200 cursor-pointer ${isSelected ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/5 bg-[#1e1e24]/30 hover:bg-[#1e1e24]'}`}>
                          <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">OFERTA</div>
                          <div className={`p-3 rounded-lg mr-4 ${isSelected ? 'bg-yellow-500 text-black' : 'bg-black/30 text-yellow-500'}`}><Package size={20}/></div>
                          <div className="flex-1">
                             <h4 className="font-bold text-sm text-white">{item.title}</h4>
                             <p className="text-xs text-gray-400 mb-1">{item.description}</p>
                             <p className="text-xs text-yellow-500 font-bold">R$ {item.price}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-yellow-500 bg-yellow-500' : 'border-gray-600'}`}>{isSelected && <CheckCircle size={12} className="text-black"/>}</div>
                       </div>
                    )
                  })}
                </div>
              </div>
            )}
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#1e1e24] p-4 md:p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20">
         <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 w-full md:w-auto">
               <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Estimado</p>
               <div className="flex items-end gap-2">
                  <p className="text-3xl font-black text-white">R$ {total}</p>
                  <p className="text-xs text-gray-500 mb-1 hidden md:block"> (Selecione os itens acima)</p>
               </div>
            </div>
            <button 
              onClick={handleSendWhatsapp}
              disabled={!hasItems}
              className={`w-full md:w-auto px-8 py-3 rounded-lg font-bold text-sm tracking-widest flex items-center justify-center gap-2 transition-all 
                ${hasItems 
                  ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg hover:shadow-green-500/20' 
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
                }`}
            >
              <MessageCircle size={18} /> {hasItems ? 'FECHAR NO WHATSAPP' : 'SELECIONE UM ITEM'}
            </button>
         </div>
      </div>

    </motion.div>
  );
};

// Carrossel Otimizado
const ProjectCarousel = ({ projects, onSelect }) => {
  const scrollRef = useRef(null);
  const [shuffledProjects, setShuffledProjects] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (projects.length > 0) {
      const shuffled = [...projects].sort(() => 0.5 - Math.random());
      setShuffledProjects(shuffled);
    }
  }, [projects]);

  useEffect(() => {
    if (isPaused || shuffledProjects.length === 0) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, shuffledProjects]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (shuffledProjects.length === 0) return <p className="text-gray-500">Nenhum projeto adicionado ainda.</p>;

  return (
    <div className="flex items-center gap-4 group" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <button onClick={() => scroll('left')} className="hidden md:flex bg-[#1e1e24] border border-white/10 p-3 rounded-full text-white hover:bg-purple-600 hover:border-purple-600 transition-all z-20 shrink-0"><ChevronLeft size={24} /></button>
      <div ref={scrollRef} className="flex gap-6 overflow-x-auto py-4 snap-x snap-mandatory scrollbar-hide w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {shuffledProjects.map((project) => (
          <div key={project.id} onClick={() => onSelect(project)} className="min-w-[85vw] md:min-w-[350px] snap-center cursor-pointer group/card">
            <div className="relative h-60 rounded-xl overflow-hidden bg-gray-800 shadow-lg border border-white/5 mb-3">
              <img src={optimizeImage(project.coverImage, 600)} loading="lazy" className="w-full h-full object-cover transform group-hover/card:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-purple-900/60 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-center justify-center"><div className="bg-white text-black px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold tracking-widest shadow-xl">VER DETALHES <ArrowRight size={14}/></div></div>
            </div>
            <h3 className="text-lg font-bold text-white group-hover/card:text-purple-400 transition-colors truncate">{project.title}</h3>
            <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">{Array.isArray(project.categoryNames) ? project.categoryNames[0] : project.categoryName}</span>
          </div>
        ))}
      </div>
      <button onClick={() => scroll('right')} className="hidden md:flex bg-[#1e1e24] border border-white/10 p-3 rounded-full text-white hover:bg-purple-600 hover:border-purple-600 transition-all z-20 shrink-0"><ChevronRight size={24} /></button>
    </div>
  );
};

const ProjectModal = ({ project, onClose }) => {
  const [zoomedImage, setZoomedImage] = useState(null);
  if (!project) return null;
  const categoriesDisplay = Array.isArray(project.categoryNames) ? project.categoryNames.join(" • ").toUpperCase() : (project.categoryName || "PROJETO");

  return (
    <>
      <AnimatePresence>
        {zoomedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setZoomedImage(null)}>
            <img src={zoomedImage} className="max-w-full max-h-full object-contain rounded shadow-2xl" />
            <button className="absolute top-8 right-8 text-white bg-white/10 p-2 rounded-full hover:bg-white/20"><X size={32}/></button>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-[#1e1e24] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl relative shadow-2xl custom-scrollbar" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white z-10 hover:bg-white/20 transition-colors"><X size={20} /></button>
          <div className="relative h-64 md:h-80 w-full bg-gray-900 group cursor-zoom-in" onClick={() => setZoomedImage(project.coverImage)}>
            {project.coverImage && <img src={optimizeImage(project.coverImage, 1200)} className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e24] to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><div className="bg-black/50 p-3 rounded-full text-white backdrop-blur"><Maximize2 size={24}/></div></div>
            <div className="absolute bottom-6 left-6 pointer-events-none">
              <span className="px-3 py-1 bg-purple-600 text-[10px] font-bold tracking-widest rounded-full text-white mb-3 inline-block">{categoriesDisplay}</span>
              <h2 className="text-3xl md:text-5xl font-black text-white">{project.title}</h2>
            </div>
          </div>
          <div className="p-8 grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{project.fullDescription}
              <h4 className="text-white font-bold mt-8 mb-4 border-b border-white/5 pb-2">Galeria do Projeto</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.gallery && project.gallery.map((img, i) => (
                  <div key={i} className="relative group cursor-zoom-in" onClick={() => setZoomedImage(img)}>
                     <img src={optimizeImage(img, 800)} loading="lazy" className="rounded w-full h-48 object-cover hover:opacity-90 transition-opacity bg-gray-800" />
                     <div className="absolute top-2 right-2 bg-black/50 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-white"><Maximize2 size={16}/></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-black/20 p-6 rounded-xl h-fit border border-white/5">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Ficha Técnica</h4>
              <div className="space-y-2 text-sm text-gray-300"><p>Ano: {project.year}</p></div>
              <div className="mt-4 flex flex-wrap gap-2">{project.tags.map(tag => <span key={tag} className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-1 rounded">#{tag}</span>)}</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

const ServiceProjectsModal = ({ service, projects, onClose, onSelectProject }) => {
  const filteredProjects = projects.filter(p => {
    if (p.serviceIds && Array.isArray(p.serviceIds)) return p.serviceIds.includes(service.id);
    return Number(p.serviceId) === service.id;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }} className="bg-[#121214] w-full max-w-5xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 relative p-8 custom-scrollbar" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20"><X size={20} /></button>
        <div className="mb-8"><span className="text-purple-500 text-xs font-bold tracking-widest uppercase">Portfólio Filtrado</span><h2 className="text-3xl font-black mt-2">PROJETOS DE {service.title.toUpperCase()}</h2></div>
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <div key={project.id} onClick={() => onSelectProject(project)} className="group cursor-pointer">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                  <img src={optimizeImage(project.coverImage, 400)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="text-xs font-bold bg-white text-black px-3 py-1 rounded-full">VER PROJETO</span></div>
                </div>
                <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors">{project.title}</h4>
              </div>
            ))}
          </div>
        ) : (<div className="text-center py-20 text-gray-500"><p>Ainda não há projetos cadastrados nesta categoria.</p></div>)}
      </motion.div>
    </motion.div>
  );
};

// --- PÁGINA HOME ---
const PortfolioView = ({ db, isLoading, onNavigate, activeSection, onOpenContact, onOpenBudget }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const renderServiceIcon = (iconName) => {
    const IconComponent = SERVICE_ICONS[iconName] || Layers;
    return <IconComponent size={32} className="text-purple-500 mb-4 transition-transform" />;
  };

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if(element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#121214] min-h-screen text-white font-sans selection:bg-purple-500 selection:text-white scroll-smooth relative">
      <Navbar profile={db.profile} onNavigate={onNavigate} currentView="home" isLoading={isLoading} activeSection={activeSection} onOpenContact={onOpenContact} onOpenBudget={onOpenBudget} />
      
      <AnimatePresence>
        {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
        {selectedService && (
          <ServiceProjectsModal 
            service={selectedService} 
            projects={db.projects} 
            onClose={() => setSelectedService(null)} 
            onSelectProject={(p) => { setSelectedService(null); setTimeout(() => setSelectedProject(p), 300); }} 
          />
        )}
      </AnimatePresence>

      <section id="home" className="min-h-screen flex items-center pt-20 px-8 md:px-20 relative overflow-hidden">
        <div className="w-full md:w-1/2 z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-[2px] w-10 bg-purple-500"></div>
              {isLoading ? <Skeleton className="h-4 w-32"/> : <span className="text-purple-400 font-bold tracking-[0.3em] text-xs uppercase">{db.profile.role}</span>}
            </div>
            {isLoading ? <div className="space-y-4 mb-8"><Skeleton className="h-20 w-3/4"/><Skeleton className="h-20 w-1/2"/></div> : <h1 className="text-5xl md:text-7xl font-black leading-[1.1] mb-6">{db.profile.bioTitle}</h1>}
            {isLoading ? <Skeleton className="h-4 w-96 mb-8"/> : <p className="text-gray-400 max-w-md leading-relaxed mb-8">{db.profile.bioText}</p>}
            <div className="flex gap-4">
                <button onClick={() => scrollTo('projects')} className="inline-flex items-center gap-2 text-white font-bold border-b border-purple-500 pb-1 hover:text-purple-400 transition-colors">VER PORTFOLIO <ArrowRight size={16} /></button>
                <button onClick={onOpenBudget} className="inline-flex items-center gap-2 text-gray-500 font-bold border-b border-gray-700 pb-1 hover:text-white hover:border-white transition-colors">FAZER ORÇAMENTO</button>
            </div>
          </motion.div>
        </div>
        <div className="absolute right-0 top-0 w-1/2 h-full hidden md:flex items-center justify-center opacity-60"><div className="w-[600px] h-[600px] bg-purple-900/30 rounded-full blur-[100px] absolute"></div></div>
      </section>

      <section id="projects" className="py-20 px-8 md:px-20">
        <div className="mb-10"><h2 className="text-4xl font-black mb-4">PROJETOS RECENTES</h2><div className="h-1 w-20 bg-purple-600"></div></div>
        {isLoading ? <div className="flex gap-8 overflow-hidden"><Skeleton className="min-w-[400px] h-64 rounded-2xl"/><Skeleton className="min-w-[400px] h-64 rounded-2xl"/></div> : (
          <ProjectCarousel projects={db.projects} onSelect={setSelectedProject} />
        )}
      </section>

      <section id="services" className="py-20 px-8 md:px-20">
        <div className="flex justify-between items-end mb-20">
            <div><h2 className="text-4xl font-black mb-4">O QUE EU FAÇO</h2><div className="h-1 w-20 bg-purple-600"></div></div>
            <button onClick={onOpenBudget} className="hidden md:flex items-center gap-2 text-purple-400 font-bold tracking-widest text-xs hover:text-white transition-colors">VER PREÇOS <ArrowRight size={14}/></button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {db.services.map((service) => {
             const hasDiscount = service.discountPercent > 0;
             const finalPrice = getFinalPrice(service);
             const Icon = SERVICE_ICONS[service.icon] || Layers;
             return (
              <motion.div 
                key={service.id} 
                whileHover={{ y: -5 }} 
                onClick={() => setSelectedService(service)}
                className="p-8 rounded-2xl bg-[#1e1e24] shadow-lg border border-white/5 cursor-pointer hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all group relative overflow-hidden"
              >
                {hasDiscount && <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-widest animate-pulse">OFERTA</div>}
                
                <div className={`mb-4 flex justify-between ${hasDiscount ? 'text-green-400' : 'text-purple-500'}`}>
                  <Icon size={32}/>
                  <span className="text-[10px] bg-white/10 px-2 py-1 rounded h-fit text-gray-400 group-hover:text-white transition-colors">VER PROJETOS</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-gray-400 text-sm mb-6">{service.text}</p>
                <div className="mt-auto border-t border-white/5 pt-4 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500">A PARTIR DE</span>
                  <div className="flex flex-col items-end">
                     {hasDiscount && <span className="text-[10px] text-gray-500 line-through">R$ {service.price}</span>}
                     <span className={`${hasDiscount ? 'text-green-400' : 'text-purple-400'} font-bold`}>R$ {finalPrice}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      <section id="about" className="py-20 px-8 md:px-20 bg-[#151518]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2 relative">
            <div className="absolute inset-0 bg-purple-600 rounded-2xl transform rotate-3 blur opacity-50"></div>
            {isLoading ? <Skeleton className="h-96 w-full rounded-2xl"/> : 
              <img src={optimizeImage(db.profile.aboutImage, 800) || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800"} className="relative rounded-2xl shadow-2xl w-full h-96 object-cover grayscale hover:grayscale-0 transition-all duration-500" alt="Sobre Mim" />
            }
          </div>
          <div className="w-full md:w-1/2">
            <span className="text-purple-500 text-xs font-bold tracking-widest uppercase mb-2 block">Quem Sou Eu</span>
            <h2 className="text-4xl font-black mb-6">SOBRE O <span className="text-purple-500">CRIATIVO</span></h2>
            {isLoading ? <Skeleton className="h-40 w-full"/> : 
              <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line mb-8">{db.profile.aboutText || "Adicione seu texto no painel."}</p>
            }
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3"><CheckCircle className="text-purple-500" size={20}/><span className="text-sm font-bold">Experiência</span></div>
              <div className="flex items-center gap-3"><CheckCircle className="text-purple-500" size={20}/><span className="text-sm font-bold">Suporte Dedicado</span></div>
              <div className="flex items-center gap-3"><CheckCircle className="text-purple-500" size={20}/><span className="text-sm font-bold">Prazos Cumpridos</span></div>
              <div className="flex items-center gap-3"><CheckCircle className="text-purple-500" size={20}/><span className="text-sm font-bold">Foco em Resultados</span></div>
            </div>
            
            <button onClick={onOpenContact} className="mt-8 bg-white text-black px-8 py-3 rounded-full font-bold text-xs tracking-widest hover:bg-purple-500 hover:text-white transition-all shadow-lg">ENTRAR EM CONTATO</button>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center bg-[#121214] text-gray-600 text-[10px] tracking-widest relative">
        <p>© {new Date().getFullYear()} {db.profile.name}.</p>
        <a href="?mode=admin" target="_blank" rel="noopener noreferrer" className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 hover:opacity-100 p-2 text-purple-500" title="Acessar Painel Admin"><Lock size={12} /></a>
      </footer>
    </div>
  );
};

// --- ADMIN AREA (Mantido) ---
const AdminArea = ({ db, onUpdateDb }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState('projects');
  const [editingItem, setEditingItem] = useState(null);
  const [newSocial, setNewSocial] = useState({ platform: 'whatsapp', label: '', url: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [isIndefiniteCombo, setIsIndefiniteCombo] = useState(true);

  const handleLogin = (e) => {
    e.preventDefault();
    // LEITURA DA SENHA SEGURA DO .ENV
    const envPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin';
    if (passwordInput === envPassword) setIsAuthenticated(true);
    else alert('Senha incorreta!');
  };

  const handleLogout = () => window.close();

  const uploadToCloudinary = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("cloud_name", CLOUDINARY_CLOUD_NAME);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST", body: formData
      });
      const data = await res.json();
      if (data.secure_url) return data.secure_url;
      else throw new Error("Falha no upload");
    } catch (error) {
      console.error("Erro Cloudinary:", error);
      alert("Erro ao enviar imagem.");
      return null;
    }
  };

  const handleSaveToFirebase = async (newData) => {
    setIsSaving(true);
    setUploadProgress("Salvando..."); 
    try {
      await setDoc(doc(firestoreDB, "content", "portfolio-data"), newData);
      onUpdateDb(newData);
      alert("Salvo com sucesso!");
    } catch (error) {
      alert("FALHA: " + error.message);
    } finally {
      setUploadProgress("");
      setIsSaving(false);
    }
  };

  const handleProfileChange = (e) => {
    const newData = { ...db, profile: { ...db.profile, [e.target.name]: e.target.value } };
    onUpdateDb(newData);
  };

  const saveProfileWithImage = async () => {
    setIsSaving(true);
    const fileInput = document.getElementById("profileImageInput");
    let imageUrl = db.profile.aboutImage;

    if (fileInput && fileInput.files[0]) {
      setUploadProgress("Enviando foto...");
      const url = await uploadToCloudinary(fileInput.files[0]);
      if (url) imageUrl = url;
    }

    const newData = { ...db, profile: { ...db.profile, aboutImage: imageUrl } };
    await handleSaveToFirebase(newData);
    setIsSaving(false);
    setUploadProgress("");
  };

  const addSocial = (e) => { e.preventDefault(); const socialToAdd = { ...newSocial, id: Date.now() }; const updatedSocials = db.socials ? [...db.socials, socialToAdd] : [socialToAdd]; const newData = { ...db, socials: updatedSocials }; handleSaveToFirebase(newData); setNewSocial({ ...newSocial, label: '', url: '' }); };
  const removeSocial = (id) => { const newData = { ...db, socials: db.socials.filter(s => s.id !== id) }; handleSaveToFirebase(newData); };

  const saveProject = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setUploadProgress("Preparando envio...");

    try {
      const formData = new FormData(e.target);
      const coverFile = formData.get('coverFile');
      const galleryFiles = formData.getAll('galleryFiles');

      let coverUrl = editingItem?.coverImage || "";
      if (coverFile && coverFile.size > 0) {
        setUploadProgress("Enviando capa...");
        const url = await uploadToCloudinary(coverFile);
        if (url) coverUrl = url;
      }

      let galleryUrls = editingItem?.gallery || [];
      if (galleryFiles && galleryFiles.length > 0 && galleryFiles[0].size > 0) {
        setUploadProgress("Enviando galeria...");
        const uploadPromises = Array.from(galleryFiles).map(file => uploadToCloudinary(file));
        const uploadedUrls = await Promise.all(uploadPromises);
        galleryUrls = [...galleryUrls, ...uploadedUrls.filter(u => u !== null)];
      }

      const selectedServiceIds = [];
      const selectedServiceNames = [];
      db.services.forEach(s => {
        if (formData.get(`service_${s.id}`)) {
          selectedServiceIds.push(s.id);
          selectedServiceNames.push(s.title);
        }
      });

      const newProject = {
        id: editingItem?.id || Date.now(),
        title: formData.get('title'),
        serviceIds: selectedServiceIds, 
        categoryNames: selectedServiceNames, 
        coverImage: coverUrl,
        shortDescription: formData.get('shortDescription'),
        fullDescription: formData.get('fullDescription'),
        year: formData.get('year'),
        gallery: galleryUrls,
        tags: formData.get('tags').split(',').map(t => t.trim())
      };
      
      const updatedProjects = editingItem?.id ? db.projects.map(p => p.id === newProject.id ? newProject : p) : [...db.projects, newProject];
      const newData = { ...db, projects: updatedProjects };
      await handleSaveToFirebase(newData);
      setEditingItem(null);

    } catch (error) {
      alert("Erro: " + error.message);
    } finally {
      setUploadProgress("");
      setIsSaving(false);
    }
  };

  const deleteProject = (id) => { if (window.confirm('Deletar projeto?')) { const newData = { ...db, projects: db.projects.filter(p => p.id !== id) }; handleSaveToFirebase(newData); } };

  const saveService = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newService = {
      id: editingItem?.id || Date.now(),
      title: formData.get('title'),
      text: formData.get('text'),
      icon: formData.get('icon'),
      price: formData.get('price'),
      unit: formData.get('unit'),
      isQuantity: !!formData.get('isQuantity'),
      discountPercent: Number(formData.get('discountPercent')) || 0
    };
    const updatedServices = editingItem?.id ? db.services.map(s => s.id === newService.id ? newService : s) : [...db.services, newService];
    const newData = { ...db, services: updatedServices };
    handleSaveToFirebase(newData);
    setEditingItem(null);
  };

  const deleteService = (id) => { if (window.confirm('Deletar serviço?')) { const newData = { ...db, services: db.services.filter(s => s.id !== id) }; handleSaveToFirebase(newData); } };

  const saveCombo = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const selectedServices = [];
    const servicePrices = [];
    db.services.forEach(s => {
      if (formData.get(`service_${s.id}`)) {
          selectedServices.push(s.title);
          servicePrices.push(Number(s.price));
      }
    });

    const discount = Number(formData.get('discountPercent')) || 0;
    const sum = servicePrices.reduce((a, b) => a + b, 0);
    const finalPrice = sum - (sum * (discount / 100));

    const newCombo = {
      id: editingItem?.id || Date.now(),
      title: formData.get('title'),
      description: formData.get('description'),
      price: finalPrice.toFixed(0),
      discountPercent: discount,
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      isIndefinite: isIndefiniteCombo, 
      selectedServicesNames: selectedServices
    };

    const updatedCombos = editingItem?.id ? (db.combos || []).map(c => c.id === newCombo.id ? newCombo : c) : [...(db.combos || []), newCombo];
    const newData = { ...db, combos: updatedCombos };
    handleSaveToFirebase(newData);
    setEditingItem(null);
  };

  const deleteCombo = (id) => { if (window.confirm('Deletar combo?')) { const newData = { ...db, combos: db.combos.filter(c => c.id !== id) }; handleSaveToFirebase(newData); } };

  if (!isAuthenticated) return (
      <div className="min-h-screen bg-[#0d0d10] flex items-center justify-center text-white">
        <form onSubmit={handleLogin} className="bg-[#1e1e24] p-10 rounded-2xl border border-purple-500/30 w-full max-w-sm flex flex-col gap-4 shadow-2xl">
          <h2 className="text-2xl font-black text-center mb-4 text-purple-500">ADMIN PAINEL</h2>
          <input type="password" autoFocus placeholder="Senha (admin)" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} className="bg-black/40 border border-white/10 p-3 rounded text-white outline-none focus:border-purple-500 transition-colors" />
          <button className="bg-purple-600 py-3 rounded font-bold hover:bg-purple-500 transition-colors">ENTRAR</button>
        </form>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#0d0d10] text-white flex font-sans">
      <aside className="w-64 bg-[#1e1e24] border-r border-white/5 flex flex-col p-6">
        <h2 className="text-xl font-black text-white mb-10 tracking-tighter">ADMIN <span className="text-purple-500">DASHBOARD</span></h2>
        {isSaving && <div className="text-xs text-green-400 font-bold mb-4 animate-pulse">{uploadProgress || "SALVANDO..."}</div>}
        <nav className="flex-1 space-y-2">
          <button onClick={() => { setActiveTab('projects'); setEditingItem(null); }} className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'projects' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}><Briefcase size={18} /> Projetos</button>
          <button onClick={() => { setActiveTab('services'); setEditingItem(null); }} className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'services' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}><Grid size={18} /> Serviços</button>
          <button onClick={() => { setActiveTab('combos'); setEditingItem(null); }} className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'combos' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}><Package size={18} /> Combos & Promo</button>
          <button onClick={() => { setActiveTab('profile'); setEditingItem(null); }} className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'profile' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}><User size={18} /> Perfil & Social</button>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-bold mt-auto pt-6 border-t border-white/5"><LogOut size={16} /> Sair</button>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto h-screen">
        {/* ABA PROJETOS */}
        {activeTab === 'projects' && (
          <div>
            <div className="flex justify-between items-center mb-8"><h1 className="text-3xl font-bold">Gerenciar Projetos</h1><button onClick={() => setEditingItem({})} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"><Plus size={16}/> Novo</button></div>
            {editingItem ? (
              <form onSubmit={saveProject} className="bg-[#1e1e24] p-8 rounded-xl border border-white/10 max-w-2xl space-y-4">
                <input name="title" defaultValue={editingItem.title} placeholder="Título do Projeto" required className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" />
                <label className="block text-xs font-bold text-gray-400 uppercase mb-3">Vincular a quais Serviços?</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto bg-black/20 p-2 rounded">{db.services.map(s => (<div key={s.id} className="flex items-center gap-2 p-2 hover:bg-white/5 rounded"><input type="checkbox" name={`service_${s.id}`} defaultChecked={editingItem.serviceIds?.includes(s.id) || editingItem.serviceId === s.id} className="accent-purple-500"/><span className="text-sm">{s.title}</span></div>))}</div>
                <div className="bg-black/20 p-4 rounded border border-white/5"><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Imagem de Capa</label><input type="file" name="coverFile" accept="image/*" className="w-full text-sm text-gray-400"/>{editingItem.coverImage && <img src={optimizeImage(editingItem.coverImage, 200)} className="mt-2 h-20 rounded object-cover" alt="Preview"/>}</div>
                <div className="bg-black/20 p-4 rounded border border-white/5"><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Adicionar Imagens à Galeria</label><input type="file" name="galleryFiles" accept="image/*" multiple className="w-full text-sm text-gray-400"/></div>
                <textarea name="shortDescription" defaultValue={editingItem.shortDescription} placeholder="Descrição Curta" className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" rows="2" />
                <textarea name="fullDescription" defaultValue={editingItem.fullDescription} placeholder="Descrição Completa (Texto longo)" className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" rows="5" />
                <div className="grid grid-cols-2 gap-4"><input name="year" defaultValue={editingItem.year} placeholder="Ano" className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" /><input name="tags" defaultValue={editingItem.tags?.join(', ')} placeholder="Tags (separar por vírgula)" className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" /></div>
                <div className="flex justify-end gap-3 mt-4"><button type="button" onClick={() => setEditingItem(null)} className="text-gray-400 px-4">Cancelar</button><button type="submit" disabled={isSaving} className="bg-purple-600 text-white px-6 py-2 rounded font-bold">Salvar Projeto</button></div>
              </form>
            ) : (
              <div className="grid gap-4">{db.projects.map(p => (<div key={p.id} className="bg-[#1e1e24] p-4 rounded-lg flex justify-between items-center border border-white/5"><div className="flex items-center gap-4"><img src={optimizeImage(p.coverImage, 100)} className="w-12 h-12 rounded object-cover" /><div><h4 className="font-bold">{p.title}</h4><span className="text-xs text-purple-400">{Array.isArray(p.categoryNames) ? p.categoryNames.join(", ") : p.categoryName}</span></div></div><div className="flex gap-2"><button onClick={() => setEditingItem(p)} className="p-2 bg-blue-600/20 text-blue-400 rounded"><Edit2 size={16}/></button><button onClick={() => deleteProject(p.id)} className="p-2 bg-red-600/20 text-red-400 rounded"><Trash2 size={16}/></button></div></div>))}</div>
            )}
          </div>
        )}

        {/* ABA SERVIÇOS */}
        {activeTab === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-8"><h1 className="text-3xl font-bold">Gerenciar Serviços</h1><button onClick={() => setEditingItem({})} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"><Plus size={16}/> Novo</button></div>
            {editingItem ? (
              <form onSubmit={saveService} className="bg-[#1e1e24] p-8 rounded-xl border border-white/10 max-w-2xl space-y-4">
                <input name="title" defaultValue={editingItem.title} placeholder="Nome do Serviço" required className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" />
                <textarea name="text" defaultValue={editingItem.text} placeholder="Descrição" className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" rows="3" />
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-gray-400 uppercase">Preço Unitário (R$)</label><input type="number" name="price" defaultValue={editingItem.price} placeholder="Ex: 100" className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" /></div>
                  <div><label className="block text-xs font-bold text-gray-400 uppercase">Unidade</label><input name="unit" defaultValue={editingItem.unit} placeholder="Ex: tela / hora / mês" className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" /></div>
                </div>
                <div className="bg-black/20 p-4 rounded border border-white/5"><label className="block text-xs font-bold text-purple-400 uppercase mb-2">Aplicar Promoção?</label><div className="flex items-center gap-4"><span className="text-sm">Desconto (%):</span><input type="number" name="discountPercent" defaultValue={editingItem.discountPercent || 0} className="w-20 bg-black/30 p-2 rounded text-white" placeholder="0" /></div></div>
                <div className="flex items-center gap-3 my-4"><input type="checkbox" name="isQuantity" defaultChecked={editingItem.isQuantity} className="w-5 h-5 accent-purple-600" /><label className="text-sm text-gray-300">Permitir selecionar quantidade?</label></div>
                <label className="block text-xs font-bold text-gray-400 uppercase">Ícone</label>
                <select name="icon" defaultValue={editingItem.icon || 'Layers'} className="w-full bg-black/30 p-3 rounded border border-white/10 text-white">{Object.keys(SERVICE_ICONS).map(iconName => <option key={iconName} value={iconName}>{iconName}</option>)}</select>
                <div className="flex justify-end gap-3 mt-4"><button type="button" onClick={() => setEditingItem(null)} className="text-gray-400 px-4">Cancelar</button><button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded font-bold">Salvar</button></div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{db.services.map(s => (<div key={s.id} className="bg-[#1e1e24] p-4 rounded-lg flex justify-between items-start border border-white/5"><div><h4 className="font-bold">{s.title}</h4><p className="text-xs text-gray-500">{s.text}</p>{s.discountPercent > 0 ? <p className="text-green-400 font-bold mt-2">R$ {getFinalPrice(s)} (-{s.discountPercent}%)</p> : <p className="text-purple-400 font-bold mt-2">R$ {s.price}</p>}</div><div className="flex gap-2"><button onClick={() => setEditingItem(s)} className="p-2 bg-blue-600/20 text-blue-400 rounded"><Edit2 size={16}/></button><button onClick={() => deleteService(s.id)} className="p-2 bg-red-600/20 text-red-400 rounded"><Trash2 size={16}/></button></div></div>))}</div>
            )}
          </div>
        )}

        {/* ABA COMBOS */}
        {activeTab === 'combos' && (
          <div>
            <div className="flex justify-between items-center mb-8"><h1 className="text-3xl font-bold">Gerenciar Combos</h1><button onClick={() => { setEditingItem({}); setIsIndefiniteCombo(true); }} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"><Plus size={16}/> Novo Combo</button></div>
            {editingItem ? (
              <form onSubmit={saveCombo} className="bg-[#1e1e24] p-8 rounded-xl border border-white/10 max-w-2xl space-y-4">
                <input name="title" defaultValue={editingItem.title} placeholder="Nome do Combo (ex: Combo Startup)" required className="w-full bg-black/30 p-3 rounded border border-white/10 text-white font-bold" />
                <textarea name="description" defaultValue={editingItem.description} placeholder="Descreva o que vem no pacote..." required className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" rows="3" />
                <div className="bg-purple-500/10 p-4 rounded border border-purple-500/30"><label className="block text-xs font-bold text-purple-300 uppercase mb-2">Calcular Preço Automático</label><div className="flex items-center gap-4"><span className="text-sm text-white">Aplicar Desconto (%):</span><input type="number" name="discountPercent" defaultValue={editingItem.discountPercent} placeholder="Ex: 15" className="w-20 bg-black/30 p-2 rounded text-white" /><span className="text-xs text-gray-400 ml-auto">O sistema somará os serviços abaixo e aplicará o desconto.</span></div></div>
                <div className="grid grid-cols-2 gap-4 mt-4"><div className="flex items-center gap-2"><input type="checkbox" name="isIndefinite" checked={isIndefiniteCombo} onChange={(e) => setIsIndefiniteCombo(e.target.checked)} className="w-4 h-4 accent-purple-500" /><label className="text-sm text-white">Por tempo indeterminado?</label></div></div>
                {!isIndefiniteCombo && (<div className="grid grid-cols-2 gap-4 bg-black/20 p-4 rounded animate-fade-in"><div><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Início</label><input type="datetime-local" name="startDate" defaultValue={editingItem.startDate} className="w-full bg-black/30 p-2 rounded text-white text-xs" /></div><div><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Fim</label><input type="datetime-local" name="endDate" defaultValue={editingItem.endDate} className="w-full bg-black/30 p-2 rounded text-white text-xs" /></div></div>)}
                <div className="border-t border-white/10 pt-4"><label className="block text-xs font-bold text-gray-400 uppercase mb-3">Selecione os Serviços Inclusos:</label><div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">{db.services.map(s => (<div key={s.id} className="flex items-center gap-2 p-2 hover:bg-white/5 rounded"><input type="checkbox" name={`service_${s.id}`} defaultChecked={editingItem.selectedServicesNames?.includes(s.title)} className="accent-purple-500"/><span className="text-sm">{s.title} (R$ {s.price})</span></div>))}</div></div>
                <div className="flex justify-end gap-3 mt-4"><button type="button" onClick={() => setEditingItem(null)} className="text-gray-400 px-4">Cancelar</button><button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded font-bold">Salvar Combo</button></div>
              </form>
            ) : (
              <div className="grid gap-4">{(db.combos || []).map(c => (<div key={c.id} className="bg-[#1e1e24] p-4 rounded-lg flex justify-between items-center border border-yellow-500/30"><div><div className="flex items-center gap-2"><Tag size={16} className="text-yellow-500"/><h4 className="font-bold text-yellow-500">{c.title}</h4></div><p className="text-xs text-gray-400 mt-1">R$ {c.price} (-{c.discountPercent}%)</p></div><div className="flex gap-2"><button onClick={() => { setEditingItem(c); setIsIndefiniteCombo(c.isIndefinite); }} className="p-2 bg-blue-600/20 text-blue-400 rounded"><Edit2 size={16}/></button><button onClick={() => deleteCombo(c.id)} className="p-2 bg-red-600/20 text-red-400 rounded"><Trash2 size={16}/></button></div></div>))}</div>
            )}
          </div>
        )}

        {/* ABA PERFIL */}
        {activeTab === 'profile' && (
          <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h1 className="text-3xl font-bold mb-8">Editar Dados</h1>
              <div className="space-y-6">
                <input name="name" value={db.profile.name} onChange={handleProfileChange} className="w-full bg-[#1e1e24] p-3 rounded border border-white/10 text-white" placeholder="Seu Nome" />
                <input name="role" value={db.profile.role} onChange={handleProfileChange} className="w-full bg-[#1e1e24] p-3 rounded border border-white/10 text-white" placeholder="Sua Profissão" />
                <input name="email" value={db.profile.email} onChange={handleProfileChange} className="w-full bg-[#1e1e24] p-3 rounded border border-white/10 text-white" placeholder="Seu Email" />
                <input name="phone" value={db.profile.phone} onChange={handleProfileChange} className="w-full bg-[#1e1e24] p-3 rounded border border-white/10 text-white" placeholder="Whatsapp (Ex: 5511...)" />
                <div className="pt-6 border-t border-white/10"><h4 className="text-purple-400 font-bold mb-4">Texto Principal</h4><input name="bioTitle" value={db.profile.bioTitle} onChange={handleProfileChange} className="w-full bg-[#1e1e24] p-3 rounded border border-white/10 text-white font-bold" /><textarea name="bioText" value={db.profile.bioText} onChange={handleProfileChange} className="w-full bg-[#1e1e24] p-3 rounded border border-white/10 text-white" rows="3" /></div>
                <div className="pt-6 border-t border-white/10"><h4 className="text-purple-400 font-bold mb-4">Seção Sobre Mim</h4><textarea name="aboutText" value={db.profile.aboutText || ""} onChange={handleProfileChange} className="w-full bg-[#1e1e24] p-3 rounded border border-white/10 text-white mb-4" rows="5" placeholder="Sua biografia completa..." /><div className="bg-black/20 p-4 rounded border border-white/5"><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Foto de Perfil (Sobre)</label><input type="file" id="profileImageInput" accept="image/*" className="w-full text-sm text-gray-400"/>{db.profile.aboutImage && <img src={optimizeImage(db.profile.aboutImage, 200)} className="mt-2 h-20 rounded object-cover" alt="Preview"/>}</div></div>
                <button onClick={saveProfileWithImage} disabled={isSaving} className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded font-bold text-white mt-4 flex items-center justify-center gap-2"><Save size={18} /> {isSaving ? "Salvando..." : "Salvar Alterações de Perfil"}</button>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-8">Gerenciar Redes Sociais</h1>
              <form onSubmit={addSocial} className="bg-[#1e1e24] p-6 rounded-xl border border-white/10 mb-6 space-y-4">
                <h4 className="text-sm font-bold text-gray-400">Adicionar Nova Rede</h4>
                <select value={newSocial.platform} onChange={e => setNewSocial({...newSocial, platform: e.target.value})} className="w-full bg-black/30 p-3 rounded border border-white/10 text-white">{Object.entries(SOCIAL_PLATFORMS).map(([key, value]) => (<option key={key} value={key}>{value.label}</option>))}</select>
                <label className="text-xs text-gray-500">{SOCIAL_PLATFORMS[newSocial.platform].placeholder}</label>
                <input placeholder="Digite aqui..." value={newSocial.url} onChange={e => setNewSocial({...newSocial, url: e.target.value})} className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" required />
                <input placeholder="Nome do Botão (ex: @pedro)" value={newSocial.label} onChange={e => setNewSocial({...newSocial, label: e.target.value})} className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" required />
                <button className="w-full bg-purple-600 hover:bg-purple-500 py-2 rounded font-bold text-sm">Adicionar</button>
              </form>
              <div className="space-y-3">{db.socials && db.socials.map(social => (<div key={social.id} className="flex justify-between items-center bg-[#1e1e24] p-3 rounded border border-white/5"><div className="flex items-center gap-3"><div className="text-purple-500">{React.createElement(SOCIAL_PLATFORMS[social.platform]?.icon || Globe, { size: 18 })}</div><div><p className="text-xs font-bold uppercase text-gray-500">{SOCIAL_PLATFORMS[social.platform]?.label}</p><p className="text-sm font-bold">{social.label}</p></div></div><button onClick={() => removeSocial(social.id)} className="p-2 text-red-400 hover:bg-red-900/20 rounded"><Trash2 size={16}/></button></div>))}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// --- APP ---
export default function App() {
  const [db, setDb] = useState(INITIAL_DB);
  const [view, setView] = useState('home'); 
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [isContactOpen, setIsContactOpen] = useState(false); 
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [quantities, setQuantities] = useState({}); // Carrinho Persistente

  const updateQuantity = (id, delta, isFixed, e) => {
    if(e) e.stopPropagation(); 
    setQuantities(prev => {
      const current = prev[id] || 0;
      if (isFixed) return { ...prev, [id]: current > 0 ? 0 : 1 }; 
      const newVal = Math.max(0, current + delta);
      return { ...prev, [id]: newVal };
    });
  };

  const handleCardClick = (id, isQuantity) => {
    setQuantities(prev => {
      const current = prev[id] || 0;
      if (current === 0) return { ...prev, [id]: 1 };
      if (!isQuantity) return { ...prev, [id]: 0 };
      return prev;
    });
  };

  const total = [...db.services, ...(db.combos || [])]
    .reduce((acc, item) => {
      const qty = quantities[item.id] || 0;
      return acc + (getFinalPrice(item) * qty);
    }, 0);

  const itemCount = Object.values(quantities).filter(q => q > 0).length;

  const handleSendWhatsapp = () => {
    const allItems = [...db.services, ...(db.combos || [])];
    const selectedItems = allItems.filter(s => (quantities[s.id] || 0) > 0);
    if (selectedItems.length === 0) return alert("Selecione pelo menos um item.");
    
    let message = `Olá Pedro! Vim pelo site designerph.shop.\n\nGostaria de um orçamento para:\n\n`;
    selectedItems.forEach(s => {
      const qty = quantities[s.id];
      const unitLabel = s.isQuantity ? `(${qty} ${s.unit}${qty > 1 ? 's' : ''})` : '';
      message += `✅ *${s.title}* ${unitLabel}\n`;
    });
    message += `\n💰 *Investimento Estimado: R$ ${total},00*`;
    const cleanPhone = db.profile.phone ? db.profile.phone.replace(/\D/g, "") : "";
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const docRef = doc(firestoreDB, "content", "portfolio-data");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDb(docSnap.data());
        } else {
          await setDoc(docRef, INITIAL_DB);
        }
      } catch (error) { console.error("Erro banco:", error); } 
      finally { setLoading(false); }
    };
    
    carregarDados();

    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'admin') { setView('admin'); document.title = "Admin Painel"; }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { threshold: 0.5 });

    const sections = document.querySelectorAll('section');
    sections.forEach(section => observer.observe(section));

    return () => sections.forEach(section => observer.unobserve(section));
  }, [view]);

  if (view === 'admin') return <AdminArea db={db} onUpdateDb={setDb} />;

  return (
    <>
      <AnimatePresence>
        {isContactOpen && <ContactModal socials={db.socials} onClose={() => setIsContactOpen(false)} />}
        
        {isBudgetOpen && (
          <BudgetModal 
            db={db} 
            quantities={quantities}
            updateQuantity={updateQuantity}
            handleCardClick={handleCardClick}
            total={total}
            handleSendWhatsapp={handleSendWhatsapp}
            onClose={() => setIsBudgetOpen(false)} 
          />
        )}

        {!isBudgetOpen && itemCount > 0 && (
          <BudgetBubble itemCount={itemCount} total={total} onClick={() => setIsBudgetOpen(true)} />
        )}
      </AnimatePresence>

      <PortfolioView 
        db={db} 
        isLoading={loading} 
        onNavigate={setView} 
        activeSection={activeSection} 
        onOpenContact={() => setIsContactOpen(true)} 
        onOpenBudget={() => setIsBudgetOpen(true)}
      />
    </>
  );
}