import {
    House,
    SquaresFour,
    CalendarDots,
    ClipboardText,
    Boat,
    Users,
    Gear,
    List,
    Waves,
    Lightning,
    ChartPieSlice,
    TrendUp,
    Hourglass,
    UsersThree,
    Plus,
    PencilSimple,
    Trash,
    FloppyDisk,
    XCircle,
    MagnifyingGlass,
    Funnel,
    SortAscending,
    Bell,
    ArrowsClockwise,
    ArrowsCounterClockwise,
    CheckCircle,
    Warning,
    WarningCircle,
    Info,
    GoogleLogo,
    Envelope,
    Lock,
    Spinner,
    ArrowRight,
    ChartBar,
    Printer,
    Export,
    Image,
    CreditCard,
    Clock,
    PlayCircle,
    CaretRight,
    CaretLeft,
    CaretUp,
    CaretDown,
    MapPin,
    Coffee,
    Wrench,
    GearSix,
    Star,
    FlowArrow,
    NotePencil,
    DotsThree,
    User,
    SignOut,
    PaintBrush,
    Sun,
    Moon,
    Anchor,
    Car,
    Checks,
    DotsSixVertical,
    Eye,
    FolderOpen,
    CalendarCheck,
    X,
    Cube,
    Check,
    Icon as PhosphorIcon,
    IconProps as PhosphorIconProps
} from '@phosphor-icons/react';

// Icon name mappings for the app
export const APP_ICONS = {
    // Navigation
    home: House,
    dashboard: SquaresFour,
    calendar: CalendarDots,
    planning: ClipboardText,
    boats: Boat,
    personnel: Users,
    settings: Gear,
    menu: List,

    // Brand & Logo
    waves: Waves,
    lightning: Lightning,

    // Dashboard & Stats
    chartPieSlice: ChartPieSlice,
    trendUp: TrendUp,
    hourglass: Hourglass,
    usersThree: UsersThree,

    // Actions
    add: Plus,
    plus: Plus,
    edit: PencilSimple,
    delete: Trash,
    save: FloppyDisk,
    cancel: XCircle,
    x: X,
    search: MagnifyingGlass,
    magnifyingGlass: MagnifyingGlass, // Alias
    filter: Funnel,
    sort: SortAscending,
    clipboardText: ClipboardText,
    bell: Bell,
    arrowsClockwise: ArrowsClockwise,
    checks: Checks,
    dotsSixVertical: DotsSixVertical,
    eye: Eye,
    folderOpen: FolderOpen,

    // Status
    success: CheckCircle,
    checkCircle: CheckCircle,
    warning: Warning,
    error: XCircle,
    info: Info,
    warningCircle: WarningCircle,
    xCircle: XCircle,
    arrowsCounterClockwise: ArrowsCounterClockwise,
    trash: Trash,

    // Auth & Form
    googleLogo: GoogleLogo,
    envelope: Envelope,
    lock: Lock,
    spinner: Spinner,
    arrowRight: ArrowRight,
    chartBar: ChartBar,
    printer: Printer,
    export: Export,
    pencil: PencilSimple,
    image: Image,
    creditCard: CreditCard,

    pending: Clock,
    clock: Clock,
    inProgress: PlayCircle,
    completed: CheckCircle,
    caretRight: CaretRight,
    caretLeft: CaretLeft,
    caretUp: CaretUp,
    caretDown: CaretDown,
    mapPin: MapPin,
    coffee: Coffee,

    // Service
    service: Wrench,
    parts: GearSix,
    evaluation: Star,
    star: Star,
    workflow: FlowArrow,
    formBuilder: NotePencil,
    audit: ClipboardText,
    check: Check,
    cube: Cube,
    package: Cube,

    // UI
    chevronRight: CaretRight,
    chevronDown: CaretDown,
    chevronUp: CaretUp,
    close: XCircle,
    more: DotsThree,
    user: User,
    logout: SignOut,
    theme: PaintBrush,
    sun: Sun,
    moon: Moon,
    anchor: Anchor,
    car: Car,
    calendarCheck: CalendarCheck,
    house: House,
    users: Users,
} as const;

export type IconName = keyof typeof APP_ICONS;

export interface IconProps extends PhosphorIconProps {
    name: IconName;
}

export function Icon({ name, ...props }: IconProps) {
    const IconComponent = APP_ICONS[name];

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found in APP_ICONS`);
        return null;
    }

    return <IconComponent {...props} />;
}

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

export const ICON_SIZES: Record<IconSize, number> = {
    xs: 16,
    sm: 18,
    md: 20,
    lg: 24,
    xl: 28,
    "2xl": 32,
    "3xl": 40,
};

export function getIconSize(size: IconSize | number = "md"): number {
    if (typeof size === 'number') return size;
    return ICON_SIZES[size] ?? 20;
}

export type IconWeight = "thin" | "light" | "regular" | "bold" | "fill" | "duotone";

export const EMOJI_FALLBACKS: Record<string, string> = {
    home: "🏠",
    settings: "⚙️",
    user: "👤",
    search: "🔍",
    delete: "🗑️",
    edit: "✏️",
    add: "➕",
    close: "✖️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
    info: "ℹ️",
};


