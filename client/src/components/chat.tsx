
import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  Timestamp,
  startAfter,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Smile, Image, Users, MessageCircle, MoreVertical, X, Search, Volume2, VolumeX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import Lottie from 'lottie-react';

interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: Timestamp;
  userColor: string;
  avatar: string;
  type: 'text' | 'gif';
  gifUrl?: string;
}

interface TypingUser {
  username: string;
  timestamp: number;
}

interface ChatProps {
  matchId: string;
  className?: string;
}

const GIPHY_API_KEY = 'blTbI6GmDMjQXq1t83YDLLrE42YUDqGe';
const MESSAGES_LIMIT = 50;
const TYPING_TIMEOUT = 3000;

// Enhanced emoji set for avatars
const avatarEmojis = [
  '👤', '🧑', '👨', '👩', '🧒', '👴', '👵', '👶', '🧓', '👱',
  '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '👨‍⚕️', '👩‍⚕️', '👨‍🏫', '👩‍🏫', '👨‍💻', '👩‍💻',
  '🕵️', '💂', '👮', '👷', '🤴', '👸', '🦸', '🦹', '🧙', '🧚',
  '🎭', '🎨', '🎪', '🎯', '🎮', '🎲', '🎸', '🎺', '🎻', '🎤',
  '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸',
  '🌟', '⭐', '✨', '💫', '🔥', '💎', '🏆', '🥇', '🥈', '🥉'
];

// Professional color palette for usernames
const userColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3',
  '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43', '#10AC84', '#EE5A6F',
  '#0ABDE3', '#3867D6', '#8854D0', '#FF7675', '#74B9FF', '#0984E3',
  '#00B894', '#00CEC9', '#FD79A8', '#FDCB6E', '#6C5CE7', '#A29BFE',
  '#E17055', '#DDA0DD', '#98FB98', '#F0E68C', '#FFB6C1', '#87CEEB'
];

// Comprehensive profanity filter
const profanityWords = [
  'fuck', 'shit', 'bitch', 'damn', 'ass', 'crap', 'piss', 'bastard',
  'whore', 'slut', 'cunt', 'cock', 'dick', 'pussy', 'fck', 'fuk',
  'sht', 'btch', 'dmn', 'wtf', 'stfu', 'asshole', 'motherfucker',
  'bullshit', 'goddamn', 'hell', 'bloody', 'crap', 'darn', 'dammit'
];

// Restricted usernames
const restrictedNames = [
  'admin', 'administrator', 'mod', 'moderator', 'support', 'staff',
  'owner', 'manager', 'supervisor', 'chatbot', 'bot', 'system',
  'streamed', 'official', 'help', 'streamedbot', 'root', 'user'
];

// Harmful content patterns
const harmfulPatterns = [
  /\b(kill|die|suicide|hurt|harm|violence)\b/gi,
  /\b(hate|racist|nazi|terrorism)\b/gi,
  /\b(spam|scam|phishing)\b/gi
];

const censorMessage = (text: string): string => {
  let censored = text;
  
  // Censor profanity
  profanityWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    censored = censored.replace(regex, '***');
  });
  
  // Block harmful content
  harmfulPatterns.forEach(pattern => {
    censored = censored.replace(pattern, '[BLOCKED]');
  });
  
  // Block URLs and links
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|\b[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\b)/gi;
  censored = censored.replace(urlRegex, '[LINK REMOVED]');
  
  // Block excessive caps (more than 50% capitals)
  if (censored.length > 10) {
    const capsCount = (censored.match(/[A-Z]/g) || []).length;
    if (capsCount / censored.length > 0.5) {
      censored = censored.toLowerCase();
    }
  }
  
  return censored;
};

const validateUsername = (username: string, activeUsers: string[] = []): string | null => {
  const trimmed = username.trim().toLowerCase();
  
  if (trimmed.length < 2) return 'Username must be at least 2 characters';
  if (trimmed.length > 20) return 'Username must be less than 20 characters';
  
  // Check for duplicate usernames
  if (activeUsers.some(user => user.toLowerCase() === trimmed)) {
    return 'Username is already taken, please choose another';
  }
  
  // Check restricted names
  for (const restricted of restrictedNames) {
    if (trimmed.includes(restricted)) {
      return `Username cannot contain "${restricted}"`;
    }
  }
  
  // Check for profanity in username
  for (const word of profanityWords) {
    if (trimmed.includes(word)) {
      return 'Username contains inappropriate content';
    }
  }
  
  return null;
};

const generateUserData = (username: string) => {
  const hash = username.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return {
    color: userColors[Math.abs(hash) % userColors.length],
    avatar: avatarEmojis[Math.abs(hash) % avatarEmojis.length]
  };
};

// Sound notification functions
const createNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    console.log('Cannot create notification sound:', error);
  }
};

// Welcome animation
const welcomeAnimation = {
  v: "5.7.4",
  fr: 60,
  ip: 0,
  op: 120,
  w: 100,
  h: 100,
  nm: "Welcome Chat",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Chat Bubble",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { 
          a: 1, 
          k: [
            { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [50, 60, 0] },
            { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 60, s: [50, 40, 0] },
            { t: 120, s: [50, 50, 0] }
          ]
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { 
          a: 1, 
          k: [
            { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, t: 0, s: [0, 0, 100] },
            { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, t: 30, s: [110, 110, 100] },
            { i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] }, t: 60, s: [95, 95, 100] },
            { t: 90, s: [100, 100, 100] }
          ]
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "rc",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [40, 25] },
          r: { a: 0, k: 12 }
        }
      ],
      ip: 0,
      op: 120,
      st: 0,
      bm: 0
    }
  ]
};

export function Chat({ matchId, className = '' }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifSearch, setShowGifSearch] = useState(false);
  const [gifQuery, setGifQuery] = useState('');
  const [gifs, setGifs] = useState<any[]>([]);
  const [usernameError, setUsernameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('chat_sound_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const userData = useRef<{ color: string; avatar: string } | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastMessageCountRef = useRef<number>(0);

  // Initialize user session with global username
  useEffect(() => {
    const savedUsername = localStorage.getItem('chat_username');
    if (savedUsername) {
      setUsername(savedUsername);
      userData.current = generateUserData(savedUsername);
      setHasJoined(true);
    }
  }, []);

  // Listen to messages
  useEffect(() => {
    if (!hasJoined) return;

    const q = query(
      collection(db, `matches/${matchId}/messages`),
      orderBy('timestamp', 'desc'),
      limit(MESSAGES_LIMIT)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData: Message[] = [];
      querySnapshot.forEach((doc) => {
        messagesData.push({
          id: doc.id,
          ...doc.data()
        } as Message);
      });
      
      const sortedMessages = messagesData.reverse();
      
      // Play notification sound for new messages
      if (soundEnabled && sortedMessages.length > lastMessageCountRef.current && lastMessageCountRef.current > 0) {
        playNotificationSound();
      }
      
      lastMessageCountRef.current = sortedMessages.length;
      setMessages(sortedMessages);
      
      if (querySnapshot.docs.length > 0) {
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }
      
      setHasMoreMessages(querySnapshot.docs.length === MESSAGES_LIMIT);
    });

    return unsubscribe;
  }, [matchId, hasJoined, soundEnabled]);

  // Listen to active users
  useEffect(() => {
    if (!hasJoined || !username) return;

    const activeUsersRef = collection(db, `matches/${matchId}/activeUsers`);
    const unsubscribe = onSnapshot(activeUsersRef, (snapshot) => {
      const users: string[] = [];
      snapshot.forEach((doc) => {
        users.push(doc.data().username);
      });
      setActiveUsers(users);
    });

    return unsubscribe;
  }, [matchId, hasJoined, username]);

  // Listen to typing indicators
  useEffect(() => {
    if (!hasJoined) return;

    const q = query(
      collection(db, `matches/${matchId}/typing`),
      where('timestamp', '>', Date.now() - TYPING_TIMEOUT)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const typing: TypingUser[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.username !== username) {
          typing.push(data as TypingUser);
        }
      });
      setTypingUsers(typing);
    });

    return unsubscribe;
  }, [matchId, hasJoined, username]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when joined
  useEffect(() => {
    if (hasJoined && inputRef.current) {
      inputRef.current.focus();
    }
  }, [hasJoined]);

  // Cleanup typing indicator on unmount
  useEffect(() => {
    return () => {
      if (hasJoined && username) {
        deleteDoc(doc(db, `matches/${matchId}/typing`, username)).catch(() => {});
      }
    };
  }, [hasJoined, username, matchId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMoreMessages = async () => {
    if (!hasMoreMessages || loadingMoreMessages || !lastVisible) return;

    setLoadingMoreMessages(true);
    
    try {
      const q = query(
        collection(db, `matches/${matchId}/messages`),
        orderBy('timestamp', 'desc'),
        startAfter(lastVisible),
        limit(MESSAGES_LIMIT)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.docs.length === 0) {
        setHasMoreMessages(false);
        return;
      }

      const olderMessages: Message[] = [];
      querySnapshot.forEach((doc) => {
        olderMessages.push({
          id: doc.id,
          ...doc.data()
        } as Message);
      });

      setMessages(prev => [...olderMessages.reverse(), ...prev]);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMoreMessages(querySnapshot.docs.length === MESSAGES_LIMIT);
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setLoadingMoreMessages(false);
    }
  };

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = event.currentTarget;
    if (scrollTop === 0 && hasMoreMessages && !loadingMoreMessages) {
      loadMoreMessages();
    }
  }, [hasMoreMessages, loadingMoreMessages]);

  const updateTypingIndicator = async () => {
    if (!hasJoined || !username) return;

    try {
      await setDoc(doc(db, `matches/${matchId}/typing`, username), {
        username,
        timestamp: Date.now()
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(async () => {
        try {
          await deleteDoc(doc(db, `matches/${matchId}/typing`, username));
        } catch (error) {
          console.error('Error removing typing indicator:', error);
        }
      }, TYPING_TIMEOUT);
    } catch (error) {
      console.error('Error updating typing indicator:', error);
    }
  };

  const handleJoinChat = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateUsername(username, activeUsers);
    if (error) {
      setUsernameError(error);
      return;
    }

    setIsLoading(true);
    
    try {
      userData.current = generateUserData(username);
      localStorage.setItem('chat_username', username); // Global username storage
      
      // Add user to active users list
      await setDoc(doc(db, `matches/${matchId}/activeUsers`, username), {
        username,
        joinedAt: serverTimestamp(),
        lastActivity: serverTimestamp()
      });
      
      setHasJoined(true);
    
      // Send welcome message
      await sendWelcomeMessage();
      
    } catch (error) {
      console.error('Error joining chat:', error);
      setUsernameError('Failed to join chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Play notification sound
  const playNotificationSound = () => {
    if (soundEnabled) {
      createNotificationSound();
    }
  };

  // Toggle sound setting
  const toggleSound = () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    localStorage.setItem('chat_sound_enabled', JSON.stringify(newSoundEnabled));
  };

  const sendWelcomeMessage = async () => {
    try {
      await addDoc(collection(db, `matches/${matchId}/messages`), {
        username: 'StreamedBot',
        text: `🎉 Welcome ${username}! Here are the chat guidelines:\n\n✅ Be respectful and friendly\n✅ Use emojis and GIFs to express yourself\n✅ Keep conversations match-related\n\n❌ No spam, links, or inappropriate content\n❌ No impersonation or harassment\n\nEnjoy the match! ⚽`,
        timestamp: serverTimestamp(),
        userColor: '#00D2D3',
        avatar: '🤖',
        type: 'text'
      });
    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userData.current) return;

    const censoredMessage = censorMessage(newMessage.trim());
    
    // Don't send if message is completely blocked
    if (censoredMessage === '[BLOCKED]' || censoredMessage.length === 0) {
      setNewMessage('');
      return;
    }
    
    try {
      await addDoc(collection(db, `matches/${matchId}/messages`), {
        username,
        text: censoredMessage,
        timestamp: serverTimestamp(),
        userColor: userData.current.color,
        avatar: userData.current.avatar,
        type: 'text'
      });
      
      setNewMessage('');
      setShowEmojiPicker(false);
      
      // Remove typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      await deleteDoc(doc(db, `matches/${matchId}/typing`, username)).catch(() => {});
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (e.target.value.trim() && !isTyping) {
      setIsTyping(true);
      updateTypingIndicator();
    } else if (!e.target.value.trim() && isTyping) {
      setIsTyping(false);
    }
  };

  const searchGifs = async (query: string) => {
    if (!query.trim()) return;
    
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${query}&limit=20&rating=pg-13`
      );
      const data = await response.json();
      setGifs(data.data || []);
    } catch (error) {
      console.error('Error searching GIFs:', error);
      setGifs([]);
    }
  };

  const sendGif = async (gifUrl: string) => {
    if (!userData.current) return;

    try {
      await addDoc(collection(db, `matches/${matchId}/messages`), {
        username,
        text: 'sent a GIF',
        gifUrl,
        timestamp: serverTimestamp(),
        userColor: userData.current.color,
        avatar: userData.current.avatar,
        type: 'gif'
      });
      
      setShowGifSearch(false);
      setGifQuery('');
      setGifs([]);
    } catch (error) {
      console.error('Error sending GIF:', error);
    }
  };

  const addEmoji = (emoji: any) => {
    setNewMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  // Join chat form
  if (!hasJoined) {
    return (
      <Card className={`w-full max-w-md mx-auto glassmorphism ${className}`}>
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Lottie 
              animationData={welcomeAnimation} 
              style={{ width: 100, height: 100 }}
              loop={true}
            />
          </div>
          <CardTitle className="text-xl flex items-center justify-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary" />
            Join Live Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Connect with other fans watching this match
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
              <Users className="w-3 h-3" />
              <span>Real-time messaging</span>
            </div>
          </div>
          
          <form onSubmit={handleJoinChat} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Choose your username..."
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError('');
                }}
                className="h-12 text-center font-medium"
                maxLength={20}
                disabled={isLoading}
              />
              {usernameError && (
                <p className="text-destructive text-xs mt-2 text-center animate-in slide-in-from-bottom-2">
                  {usernameError}
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 font-semibold"
              disabled={isLoading || !username.trim()}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Joining...
                </div>
              ) : (
                'Start Chatting'
              )}
            </Button>
          </form>
          
          <div className="text-xs text-center text-muted-foreground/60 leading-relaxed">
            By joining, you agree to our community guidelines. Be respectful and enjoy the match!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`flex flex-col h-full glassmorphism ${className}`}>
      {/* Header */}
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3 border-b">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75" />
          </div>
          <div>
            <CardTitle className="text-lg">Live Chat</CardTitle>
            <p className="text-xs text-muted-foreground">
              {messages.length} messages
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Disable sound notifications' : 'Enable sound notifications'}
            title={soundEnabled ? 'Disable notifications' : 'Enable notifications'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-green-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
          <Badge variant="secondary" className="text-xs">
            <Users className="w-3 h-3 mr-1" />
            {username}
          </Badge>
        </div>
      </CardHeader>

      {/* Messages */}
      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea 
          className="flex-1 px-4"
          onScrollCapture={handleScroll}
        >
          <div className="space-y-4 py-4">
            {loadingMoreMessages && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-3 h-3 animate-spin rounded-full border border-muted-foreground border-t-transparent" />
                  Loading messages...
                </div>
              </div>
            )}
            
            {messages.length === 0 && !loadingMoreMessages && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <Lottie 
                  animationData={welcomeAnimation} 
                  style={{ width: 80, height: 80 }}
                  loop={true}
                />
                <div>
                  <p className="font-medium text-muted-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">
                    Be the first to start the conversation! 💬
                  </p>
                </div>
              </div>
            )}
            
            {messages.map((message, index) => {
              const isBot = message.username === 'StreamedBot';
              const isCurrentUser = message.username === username;
              const prevMessage = messages[index - 1];
              const nextMessage = messages[index + 1];
              const showAvatar = !prevMessage || prevMessage.username !== message.username;
              const showTimestamp = !nextMessage || 
                nextMessage.username !== message.username ||
                (message.timestamp && nextMessage.timestamp && 
                 nextMessage.timestamp.toDate().getTime() - message.timestamp.toDate().getTime() > 300000); // 5 minutes
              
              return (
                <div 
                  key={message.id} 
                  className={`flex gap-3 ${
                    isCurrentUser ? 'flex-row-reverse' : ''
                  } animate-in slide-in-from-bottom-2 duration-300`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {showAvatar ? (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                        isBot 
                          ? 'bg-primary/10 border-primary/20' 
                          : 'bg-muted border-border'
                      }`}>
                        {message.avatar}
                      </div>
                    ) : (
                      <div className="w-8" />
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className={`flex-1 max-w-[75%] ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                    {/* Username */}
                    {showAvatar && !isCurrentUser && (
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          className="text-xs font-semibold"
                          style={{ color: message.userColor }}
                        >
                          {message.username}
                        </span>
                      </div>
                    )}
                    
                    {/* Message Bubble */}
                    <div className={`rounded-2xl px-4 py-2 max-w-full break-words ${
                      isCurrentUser 
                        ? 'bg-primary text-primary-foreground rounded-br-md ml-auto' 
                        : isBot
                        ? 'bg-muted/50 border border-border rounded-bl-md'
                        : 'bg-muted rounded-bl-md'
                    } ${
                      message.type === 'gif' ? 'p-2' : ''
                    }`}>
                      {message.type === 'gif' ? (
                        <img 
                          src={message.gifUrl} 
                          alt="Animated GIF message"
                          className="max-w-48 max-h-48 rounded-lg"
                          width="192"
                          height="192"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.text}
                        </p>
                      )}
                    </div>
                    
                    {/* Timestamp */}
                    {showTimestamp && message.timestamp && (
                      <p className="text-xs text-muted-foreground/60 mt-1 px-1">
                        {message.timestamp.toDate().toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Typing Indicators */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-3 animate-in slide-in-from-bottom-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {typingUsers.length === 1 
                    ? `${typingUsers[0].username} is typing...`
                    : `${typingUsers.length} people are typing...`
                  }
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* GIF Search */}
        {showGifSearch && (
          <div className="border-t bg-card/50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Search GIFs..."
                value={gifQuery}
                onChange={(e) => {
                  setGifQuery(e.target.value);
                  searchGifs(e.target.value);
                }}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGifSearch(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {gifs.length > 0 && (
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {gifs.map((gif) => (
                  <button
                    key={gif.id}
                    onClick={() => sendGif(gif.images.original.url)}
                    className="aspect-square overflow-hidden rounded-md hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={gif.images.fixed_height_small.url}
                      alt={gif.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="border-t bg-card/50 p-3">
            <Picker 
              data={data} 
              onEmojiSelect={addEmoji}
              theme="auto"
              set="native"
              previewPosition="none"
              searchPosition="top"
              maxFrequentRows={2}
            />
          </div>
        )}

        {/* Input */}
        <div className="border-t bg-card/30 p-4">
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={handleInputChange}
                className="pr-20 min-h-[44px] resize-none"
                maxLength={500}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker);
                    setShowGifSearch(false);
                  }}
                  aria-label={showEmojiPicker ? 'Close emoji picker' : 'Open emoji picker'}
                >
                  <Smile className="w-4 h-4" />
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => {
                    setShowGifSearch(!showGifSearch);
                    setShowEmojiPicker(false);
                  }}
                  aria-label={showGifSearch ? 'Close GIF search' : 'Open GIF search'}
                >
                  <Image className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              size="sm"
              className="w-11 h-11 rounded-full p-0"
              disabled={!newMessage.trim()}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          
          <p className="text-xs text-muted-foreground/60 mt-2 text-center">
            Press Enter to send • Be respectful • No links or spam
          </p>
        </div>
      </div>
    </Card>
  );
}
