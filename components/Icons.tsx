/**
 * Centralized Icon Exports
 * Tree-shakes unused icons and reduces bundle size
 */

// Only export icons that are actually used in the app
export {
  // Navigation & UI
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Settings,
  MoreVertical,
  MoreHorizontal,
  
  // Trading & Finance
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  
  // Status & Actions
  CheckCircle,
  Circle,
  AlertTriangle,
  Info,
  XCircle,
  Loader2,
  
  // Time & Calendar
  Calendar,
  Clock,
  CalendarDays,
  
  // Features
  Brain,
  Heart,
  Zap,
  Award,
  Trophy,
  Star,
  BookOpen,
  FileText,
  Mic,
  Video,
  Image as ImageIcon,
  
  // Social & Sharing
  Share2,
  Download,
  Upload,
  ExternalLink,
  
  // Navigation
  Home,
  User,
  LogOut,
  LogIn,
  Lock,
  Unlock,
  
  // Charts & Analytics
  TrendingUp as ChartTrendingUp,
  BarChart as BarChartIcon,
  
} from 'lucide-react'

/**
 * Usage:
 * 
 * Instead of:
 * import { TrendingUp, DollarSign } from 'lucide-react'
 * 
 * Use:
 * import { TrendingUp, DollarSign } from '@/components/Icons'
 * 
 * This ensures tree-shaking works correctly and only imports what you need.
 */

