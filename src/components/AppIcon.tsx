import React from 'react';
import { useIconSize } from '@/contexts/IconSizeContext';
import { Menu, Settings, X, FileText, MoreVertical, ArrowLeft, Eye, Trash2, Volume2, Play, Pause, Square, Upload, Camera, GalleryVertical, User, Moon, Bell, Mic, Languages, CircleHelp, Shield, ChevronRight, Type, Key, VolumeX, RotateCcw, Zap, ZapOff, Image as ImageIcon, Pencil, Crop, Info, Send } from 'lucide-react-native';

export const AppIcons = {
  Menu,
  Settings,
  X,
  FileText,
  MoreVertical,
  ArrowLeft,
  Eye,
  Trash2,
  Volume2,
  Play,
  Pause,
  Square,
  Upload,
  Camera,
  GalleryVertical,
  User,
  Moon,
  Bell,
  Mic,
  Languages,
  CircleHelp,
  Shield,
  ChevronRight,
  Type,
  Key,
  VolumeX,
  RotateCcw,
  Zap,
  ZapOff,
  ImageIcon,
  Pencil,
  Crop,
  Info,
  Send,
  // ...add more as needed
};

interface AppIconProps {
  icon: React.ComponentType<any>;
  size?: number;
  color?: string;
  [key: string]: any;
}

export const AppIcon: React.FC<AppIconProps> = ({ icon: Icon, size, color, ...props }) => {
  const { iconSize } = useIconSize();
  return <Icon size={size || iconSize} color={color} {...props} />;
}; 