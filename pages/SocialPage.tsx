import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Music2, MessageSquare, Image, Send, Phone, Video, Search, ArrowLeft } from 'lucide-react';
import { AdUnit } from '../components/AdUnit';

const MOCK_POSTS = [
  {
    id: 1,
    user: "ZeroTwo_002",
    avatar: "https://picsum.photos/id/1027/100/100",
    image: "https://picsum.photos/id/237/400/600",
    caption: "My Future Self transformation is wild! 🌸✨ #AnimeWonderlands",
    likes: "12.5k",
    comments: "842"
  },
  {
    id: 2,
    user: "GamerKai",
    avatar: "https://picsum.photos/id/1005/100/100",
    image: "https://picsum.photos/id/1069/400/600",
    caption: "Just unlocked the Red Dragon skin in Ludo! 🐉 Who wants to play?",
    likes: "8.2k",
    comments: "156"
  },
  {
    id: 3,
    user: "NeonVibes",
    avatar: "https://picsum.photos/id/1011/100/100",
    image: "https://picsum.photos/id/1076/400/600",
    caption: "Tokyo nights via the AR filter 🌃 #Cyberpunk",
    likes: "22k",
    comments: "1.2k"
  }
];

// --- CHAT MOCK DATA ---
const CONTACTS = [
  { id: 1, name: "Naruto Uzumaki", avatar: "https://ui-avatars.com/api/?name=Naruto+Uzumaki&background=orange&color=fff", lastMsg: "Dattebayo! Ready for Ludo?", time: "10:30 AM", unread: 2 },
  { id: 2, name: "Dr. Stone", avatar: "https://ui-avatars.com/api/?name=Senku&background=green&color=fff", lastMsg: "The science of this AI is 10 billion percent correct.", time: "9:15 AM", unread: 0 },
  { id: 3, name: "Zero Two", avatar: "https://ui-avatars.com/api/?name=Zero+Two&background=pink&color=fff", lastMsg: "Darling! 🦕", time: "Yesterday", unread: 5 },
  { id: 4, name: "L Lawliet", avatar: "https://ui-avatars.com/api/?name=L&background=000&color=fff", lastMsg: "I suspect you are the winner.", time: "Yesterday", unread: 0 },
  { id: 5, name: "Gojo Satoru", avatar: "https://ui-avatars.com/api/?name=Gojo&background=purple&color=fff", lastMsg: "Domain Expansion: Infinite Void.", time: "Monday", unread: 0 },
];

const INITIAL_MESSAGES = [
  { id: 1, senderId: 1, text: "Hey! Did you check out the new Ludo update?", time: "10:28 AM", isMe: false },
  { id: 2, senderId: 0, text: "Yeah! The 3D dice physics are insane.", time: "10:29 AM", isMe: true },
  { id: 3, senderId: 1, text: "Dattebayo! Ready for Ludo? Let's play a match.", time: "10:30 AM", isMe: false },
];

export const SocialPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'FEED' | 'CHAT'>('FEED');

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="flex items-center justify-between mb-6 px-4">
        <h1 className="text-2xl font-bold">Wonder Social</h1>
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
          <button 
            onClick={() => setActiveTab('FEED')}
            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'FEED' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Image size={16} /> <span>Feed</span>
          </button>
          <button 
            onClick={() => setActiveTab('CHAT')}
            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'CHAT' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <MessageSquare size={16} /> <span>Chat</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'FEED' ? <FeedView /> : <ChatView />}
      </div>
    </div>
  );
};

// --- FEED COMPONENT ---
const FeedView = () => (
  <div className="max-w-md mx-auto pb-20 overflow-y-auto h-full px-4 scrollbar-hide">
      <div className="flex gap-4 text-sm font-bold text-slate-400 mb-6 justify-center">
          <span className="text-white border-b-2 border-pink-500 pb-1 cursor-pointer">For You</span>
          <span className="cursor-pointer hover:text-white">Following</span>
        </div>

      <div className="space-y-8">
        {MOCK_POSTS.map((post, index) => (
          <React.Fragment key={post.id}>
             {/* Feed Post */}
            <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 relative snap-center">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img src={post.avatar} alt={post.user} className="w-8 h-8 rounded-full border border-white" />
                    <span className="font-bold text-sm shadow-black drop-shadow-md text-white">{post.user}</span>
                </div>
                <button>
                    <MoreHorizontal className="text-white drop-shadow-md" />
                </button>
                </div>

                {/* Content */}
                <div className="relative aspect-[3/4] bg-slate-800">
                <img src={post.image} alt="Content" className="w-full h-full object-cover" />
                
                {/* Overlay Actions */}
                <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6 z-20">
                    <div className="flex flex-col items-center gap-1">
                    <div className="p-3 bg-slate-900/50 backdrop-blur-md rounded-full cursor-pointer hover:bg-slate-800/50 transition-colors">
                        <Heart size={24} className="text-pink-500" fill="currentColor" />
                    </div>
                    <span className="text-xs font-bold text-white shadow-black drop-shadow-sm">{post.likes}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                    <div className="p-3 bg-slate-900/50 backdrop-blur-md rounded-full cursor-pointer hover:bg-slate-800/50 transition-colors">
                        <MessageCircle size={24} className="text-white" />
                    </div>
                    <span className="text-xs font-bold text-white shadow-black drop-shadow-sm">{post.comments}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                    <div className="p-3 bg-slate-900/50 backdrop-blur-md rounded-full cursor-pointer hover:bg-slate-800/50 transition-colors">
                        <Share2 size={24} className="text-white" />
                    </div>
                    <span className="text-xs font-bold text-white shadow-black drop-shadow-sm">Share</span>
                    </div>
                </div>

                {/* Caption Area */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent pt-20">
                    <p className="text-sm text-white mb-2 line-clamp-2">{post.caption}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Music2 size={12} />
                    <span className="truncate">Original Sound - {post.user}</span>
                    </div>
                </div>
                </div>
            </div>

            {/* AD INJECTION: Place In-Feed Ad after the first post */}
            {index === 0 && <AdUnit type="in-feed" />}
          </React.Fragment>
        ))}
      </div>
  </div>
);

// --- WHATSAPP STYLE CHAT COMPONENT ---
const ChatView = () => {
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedContact]);

  const handleSendMessage = () => {
    if(!inputText.trim()) return;
    const newMsg = {
        id: Date.now(),
        senderId: 0, // Me
        text: inputText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true
    };
    setMessages([...messages, newMsg]);
    setInputText("");
    
    // Simulate Reply
    setTimeout(() => {
        const replyMsg = {
            id: Date.now() + 1,
            senderId: selectedContact?.id || 1,
            text: "That sounds awesome! 🚀",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: false
        };
        setMessages(prev => [...prev, replyMsg]);
    }, 2000);
  };

  return (
    <div className="flex h-full bg-[#111b21] rounded-2xl overflow-hidden border border-slate-800">
      
      {/* LEFT: Contact List */}
      <div className={`w-full md:w-[30%] lg:w-[35%] bg-[#111b21] border-r border-slate-800 flex flex-col ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
         {/* Sidebar Header */}
         <div className="h-16 bg-[#202c33] flex items-center justify-between px-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-full bg-slate-600 overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Me&background=random" alt="Me" />
            </div>
            <div className="flex gap-4 text-[#aebac1]">
                <MessageCircle size={20} />
                <MoreHorizontal size={20} />
            </div>
         </div>
         
         {/* Search */}
         <div className="p-2 border-b border-slate-800">
             <div className="bg-[#202c33] rounded-lg flex items-center px-4 py-2 text-[#aebac1]">
                 <Search size={18} />
                 <input type="text" placeholder="Search or start new chat" className="bg-transparent border-none outline-none ml-4 w-full text-sm text-[#d1d7db] placeholder-[#8696a0]" />
             </div>
         </div>

         {/* List */}
         <div className="flex-1 overflow-y-auto custom-scrollbar">
             {CONTACTS.map(contact => (
                 <div 
                   key={contact.id} 
                   onClick={() => setSelectedContact(contact)}
                   className={`flex items-center p-3 cursor-pointer hover:bg-[#202c33] transition-colors border-b border-slate-800/50 ${selectedContact?.id === contact.id ? 'bg-[#2a3942]' : ''}`}
                 >
                     <div className="w-12 h-12 rounded-full overflow-hidden mr-4 flex-shrink-0">
                         <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-baseline mb-1">
                             <h3 className="text-[#e9edef] font-medium truncate">{contact.name}</h3>
                             <span className={`text-xs ${contact.unread > 0 ? 'text-[#00a884]' : 'text-[#8696a0]'}`}>{contact.time}</span>
                         </div>
                         <div className="flex justify-between items-center">
                             <p className="text-[#8696a0] text-sm truncate mr-2">{contact.lastMsg}</p>
                             {contact.unread > 0 && (
                                 <div className="w-5 h-5 rounded-full bg-[#00a884] flex items-center justify-center text-[#111b21] text-xs font-bold flex-shrink-0">
                                     {contact.unread}
                                 </div>
                             )}
                         </div>
                     </div>
                 </div>
             ))}
         </div>
      </div>

      {/* RIGHT: Chat Window */}
      <div className={`w-full md:w-[70%] lg:w-[65%] flex flex-col h-full relative bg-[#0b141a] ${!selectedContact ? 'hidden md:flex' : 'flex'}`}>
          {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="h-16 bg-[#202c33] flex items-center justify-between px-4 border-b border-slate-800 z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSelectedContact(null)} className="md:hidden text-[#aebac1]">
                            <ArrowLeft size={24} />
                        </button>
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img src={selectedContact.avatar} alt={selectedContact.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                             <span className="text-[#e9edef] font-medium leading-tight">{selectedContact.name}</span>
                             <span className="text-[#8696a0] text-xs">online</span>
                        </div>
                    </div>
                    <div className="flex gap-6 text-[#aebac1]">
                        <Video size={20} />
                        <Phone size={20} />
                        <Search size={20} />
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative">
                    {/* Doodle Background Pattern Overlay */}
                    <div className="absolute inset-0 opacity-5 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] pointer-events-none"></div>
                    
                    <div className="space-y-2 relative z-10">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] md:max-w-[60%] rounded-lg p-2 px-3 relative shadow-sm text-sm ${
                                    msg.isMe ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none' : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                                }`}>
                                    <p className="mb-1">{msg.text}</p>
                                    <div className="text-[10px] text-[#8696a0] text-right flex items-center justify-end gap-1">
                                        {msg.time}
                                        {msg.isMe && <span className="text-[#53bdeb]">✓✓</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="bg-[#202c33] p-3 flex items-center gap-4 z-10">
                    <button className="text-[#8696a0]">
                        <div className="w-6 h-6 rounded-full border-2 border-[#8696a0] flex items-center justify-center text-xs font-bold">+</div>
                    </button>
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message" 
                        className="flex-1 bg-[#2a3942] rounded-lg py-2 px-4 text-[#e9edef] text-sm focus:outline-none placeholder-[#8696a0]"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className={`p-2 rounded-full transition-colors ${inputText.trim() ? 'text-[#00a884]' : 'text-[#8696a0]'}`}
                    >
                        <Send size={24} />
                    </button>
                </div>
              </>
          ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-b-8 border-[#00a884] bg-[#222e35]">
                   <div className="mb-6 opacity-80">
                       <img src="https://static.whatsapp.net/rsrc.php/v3/y6/r/wa66945g.png" alt="Intro" className="w-64 opacity-50 filter invert" />
                   </div>
                   <h2 className="text-[#e9edef] text-3xl font-light mb-4">Aditi's AI Web Chat</h2>
                   <p className="text-[#8696a0] max-w-md">Send and receive messages without keeping your phone online.<br/>Use Aditi's AI on up to 4 linked devices and 1 phone.</p>
                   <div className="mt-8 text-xs text-[#667781] flex items-center gap-2">
                       <Lock size={12} /> End-to-end encrypted
                   </div>
              </div>
          )}
      </div>
    </div>
  );
};