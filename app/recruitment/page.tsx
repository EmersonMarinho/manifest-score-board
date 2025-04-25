"use client";

import React, { useState } from 'react';
import Navbar from '../components/Navbar';

type Language = 'en' | 'pt';

const content = {
  en: {
    hero: {
      title: "Join Manifest",
      subtitle: "Become part of our elite guild and make history"
    },
    guildInfo: {
      title: "Guild Information",
      details: {
        title: "Guild Details",
        items: [
          { icon: "🏰", text: "Guild Name: Manifest" },
          { icon: "⚔️", text: "Type: PvP/Guild League" },
          { icon: "⏱️", text: "Trial Period: Yes" }
        ]
      },
      offers: {
        title: "What We Offer",
        items: [
          { icon: "🌟", text: "Competitive PvP Environment" },
          { icon: "🎮", text: "Regular Guild League Participation" },
          { icon: "👥", text: "Active and Friendly Community" },
          { icon: "📚", text: "Access to Guild Resources and Guides" }
        ]
      }
    },
    requirements: {
      title: "Player Requirements",
      technical: {
        title: "Technical Requirements",
        items: [
          { icon: "⚔️", text: "Gear Score: Hardcap / close to hardcap 790 GS" },
          { icon: "🎯", text: "Class: Sage Awakening, Hashashin Succession" },
          { icon: "💻", text: "Good internet connection and PC setup" }
        ]
      },
      activity: {
        title: "Activity Requirements",
        items: [
          { icon: "📅", text: "Regular attendance to guild events" },
          { icon: "🎮", text: "Active participation in PvP content" },
          { icon: "💬", text: "Communication through Discord" }
        ]
      }
    },
    application: {
      title: "Application Process",
      steps: [
        {
          number: "1",
          title: "Fill out the Form",
          description: "Fill out the google form with your character details and gear screenshots."
        },
        {
          number: "2",
          title: "Submit Application",
          description: "After filling out the form, wait for a response from one of our recruiters."
        },
        {
          number: "3",
          title: "Trial Period",
          description: "If your application is accepted, you'll undergo a trial period to assess your skills and compatibility with the guild."
        }
      ]
    },
    faq: {
      title: "Frequently Asked Questions",
      questions: [
        {
          question: "What does the trial period involve?",
          answer: "The trial period typically lasts 1-2 weeks during which we assess your performance in node wars, your attendance, and how well you integrate with our community."
        }
      ]
    },
    contact: {
      title: "Contact Us",
      subtitle: "Reach out to any of our recruiters to apply:",
      recruiters: [
        { name: "Vnbz", role: "Guild Master" },
        { name: "Radix", role: "Recruiter" },
        { name: "Toushiro", role: "Recruiter" }
      ]
    }
  },
  pt: {
    hero: {
      title: "Junte-se a Manifest",
      subtitle: "Guilda de hackers"
    },
    guildInfo: {
      title: "Informações da Guilda",
      details: {
        title: "Detalhes da Guilda",
        items: [
          { icon: "🏰", text: "Nome da Guilda: Manifest" },
          { icon: "⚔️", text: "Tipo: PvP/Liga de Guildas" },
          { icon: "⏱️", text: "Período de Teste: Sim" }
        ]
      },
      offers: {
        title: "O que Oferecemos",
        items: [
          { icon: "🌟", text: "Ambiente Competitivo PvP" },
          { icon: "🎮", text: "Participação Regular na Liga de Guildas" },
          { icon: "👥", text: "Comunidade Ativa e Amigável" },
          { icon: "📚", text: "Acesso a Recursos e Guias da Guilda" }
        ]
      }
    },
    requirements: {
      title: "Requisitos do Jogador",
      technical: {
        title: "Requisitos Técnicos",
        items: [
          { icon: "⚔️", text: "Gear Score: Hardcap / próximo ao hardcap 790 GS" },
          { icon: "🎯", text: "Classe: Sage Awakening, Hashashin Sucessão" },
          { icon: "💻", text: "Boa conexão com a internet e configuração de PC" }
        ]
      },
      activity: {
        title: "Requisitos de Atividade",
        items: [
          { icon: "📅", text: "Presença regular nos eventos da guilda" },
          { icon: "🎮", text: "Participação ativa em conteúdo PvP" },
          { icon: "💬", text: "Comunicação através do Discord" }
        ]
      }
    },
    application: {
      title: "Processo de Aplicação",
      steps: [
        {
          number: "1",
          title: "Preencha o Formulário",
          description: "Preencha o formulário do google com os detalhes do seu personagem e screenshots do seu equipamento."
        },
        {
          number: "2",
          title: "Envie sua Aplicação",
          description: "Após preencher o formulário, aguarde a resposta de um dos recrutadores."
        },
        {
          number: "3",
          title: "Período de Teste",
          description: "Se sua aplicação for aceita, você passará por um período de teste para avaliar suas habilidades e compatibilidade com a guilda."
        }
      ]
    },
    faq: {
      title: "Perguntas Frequentes",
      questions: [
        {
          question: "O que envolve o período de teste?",
          answer: "O período de teste geralmente dura 1-2 semanas, durante as quais avaliamos seu desempenho em node wars, sua presença e quão bem você se integra à nossa comunidade."
        }
      ]
    },
    contact: {
      title: "Contate-nos",
      subtitle: "Entre em contato com qualquer um de nossos recrutadores para se candidatar:",
      recruiters: [
        { name: "Vnbz", role: "Mestre da Guilda" },
        { name: "Radix", role: "Recrutador" },
        { name: "Toushiro", role: "Recrutador" }
      ]
    }
  }
};

export default function Recruitment() {
  const [language, setLanguage] = useState<Language>('en');
  const t = content[language];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black text-white pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Language Switcher */}
          <div className="flex justify-end mb-8">
            <button
              onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
            >
              {language === 'en' ? 'PT' : 'EN'}
            </button>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">{t.hero.title}</h1>
            <p className="text-xl text-gray-400">{t.hero.subtitle}</p>
          </div>

          {/* Guild Info Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-yellow-400">{t.guildInfo.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">{t.guildInfo.details.title}</h3>
                <ul className="space-y-4">
                  {t.guildInfo.details.items.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-yellow-400 mr-2 text-2xl">{item.icon}</span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">{t.guildInfo.offers.title}</h3>
                <ul className="space-y-4">
                  {t.guildInfo.offers.items.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-yellow-400 mr-2">{item.icon}</span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Player Requirements Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-yellow-400">{t.requirements.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">{t.requirements.technical.title}</h3>
                <ul className="space-y-4">
                  {t.requirements.technical.items.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-yellow-400 mr-2">{item.icon}</span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">{t.requirements.activity.title}</h3>
                <ul className="space-y-4">
                  {t.requirements.activity.items.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-yellow-400 mr-2">{item.icon}</span>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Application Process Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-yellow-400">{t.application.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {t.application.steps.map((step, index) => (
                <div key={index} className="bg-gray-800 p-6 rounded-lg">
                  <div className="text-center mb-4">
                    <span className="text-4xl text-yellow-400">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-center">{step.title}</h3>
                  <p className="text-gray-400 text-center">{step.description}</p>
                  {index === 0 && (
                    <div className="mt-6 text-center">
                      <a href="https://discord.gg/your-discord" target="_blank" rel="noopener noreferrer" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg inline-block">
                        {language === 'en' ? 'Submit Application' : 'Preencha o Formulário'}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-yellow-400">{t.faq.title}</h2>
            <div className="space-y-6">
              {t.faq.questions.map((faq, index) => (
                <div key={index} className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">{faq.question}</h3>
                  <p className="text-gray-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Section */}
          <section className="text-center">
            <h2 className="text-3xl font-bold mb-8 text-yellow-400">{t.contact.title}</h2>
            <p className="text-xl mb-8">{t.contact.subtitle}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {t.contact.recruiters.map((recruiter, index) => (
                <div key={index} className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-2">{recruiter.name}</h3>
                  <p className="text-gray-400">{recruiter.role}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
} 