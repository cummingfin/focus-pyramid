'use client';

import { useState, useEffect, useRef } from 'react';
import { formatDate, todayUTC, getWeekStart, getMonthName, getYear } from '@/lib/dates';
import { Check, Plus, X, ChevronLeft, ChevronRight, Link as LinkIcon, Trophy } from 'lucide-react';

export default function PyramidPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [allGoals, setAllGoals] = useState({
    daily: [] as any[],
    weekly: [] as any[],
    monthly: [] as any[],
    yearly: [] as any[],
    fiveYear: [] as any[]
  });
  
  // Editing states for each slide
  const [editingSlot, setEditingSlot] = useState<{slide: number, slot: number} | null>(null);
  const [editText, setEditText] = useState('');
  const [maxSlots, setMaxSlots] = useState({ daily: 3, weekly: 3, monthly: 3, yearly: 3, fiveYear: 3 });
  const [showLinkModal, setShowLinkModal] = useState<{slide: number, slot: number} | null>(null);
  
  // Touch/swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const carouselRef = useRef<HTMLDivElement>(null);
  const weekKey = formatDate(getWeekStart(), 'yyyy-MM-dd');

  // Load all goals from localStorage
  useEffect(() => {
    const dailyGoals = JSON.parse(localStorage.getItem('daily-outcomes') || '[]');
    const weeklyGoals = JSON.parse(localStorage.getItem(`weekly-goals-${weekKey}`) || '[]');
    const monthlyGoals = JSON.parse(localStorage.getItem('monthly-goals') || '[]');
    const yearlyGoals = JSON.parse(localStorage.getItem('yearly-goals') || '[]');
    const fiveYearGoals = JSON.parse(localStorage.getItem('five-year-goals') || '[]');

    setAllGoals({
      daily: dailyGoals,
      weekly: weeklyGoals,
      monthly: monthlyGoals,
      yearly: yearlyGoals,
      fiveYear: fiveYearGoals
    });

    // Load max slots
    const dailyMax = parseInt(localStorage.getItem('daily-max-slots') || '3');
    const weeklyMax = parseInt(localStorage.getItem(`weekly-max-slots-${weekKey}`) || '3');
    const monthlyMax = parseInt(localStorage.getItem('monthly-max-slots') || '3');
    const yearlyMax = parseInt(localStorage.getItem('yearly-max-slots') || '3');
    const fiveYearMax = parseInt(localStorage.getItem('five-year-max-slots') || '3');

    setMaxSlots({
      daily: dailyMax,
      weekly: weeklyMax,
      monthly: monthlyMax,
      yearly: yearlyMax,
      fiveYear: fiveYearMax
    });
  }, [weekKey]);

  // Touch handlers for swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  const getProgressForHorizon = (goals: any[]) => {
    if (goals.length === 0) return 0;
    const completed = goals.filter(g => g.done).length;
    return Math.round((completed / goals.length) * 100);
  };

  const getPriorityProgress = (goals: any[]) => {
    const priorityGoals = goals.filter(g => g.slot <= 3);
    if (priorityGoals.length === 0) return 0;
    const completed = priorityGoals.filter(g => g.done).length;
    return Math.round((completed / priorityGoals.length) * 100);
  };

  const getWinStatus = (goals: any[]) => {
    const priorityGoals = goals.filter(g => g.slot <= 3);
    if (priorityGoals.length === 0) return false;
    const completed = priorityGoals.filter(g => g.done).length;
    return completed >= Math.ceil(priorityGoals.length * 0.67); // 2/3 or more
  };

  const handleAddGoal = (slideIndex: number, slot: number) => {
    if (!editText.trim()) return;

    const slideKeys = ['daily', 'weekly', 'monthly', 'yearly', 'fiveYear'];
    const slideKey = slideKeys[slideIndex];

    const newGoal = {
      id: Date.now().toString(),
      slot,
      title: editText.trim(),
      done: false,
      area: slideKey === 'daily' ? null : 'work',
      linkedToParent: null,
      created_at: new Date().toISOString()
    };

    setAllGoals(prev => ({
      ...prev,
      [slideKey]: [...prev[slideKey].filter((g: any) => g.slot !== slot), newGoal]
    }));

    setEditText('');
    setEditingSlot(null);
  };

  const handleEditGoal = (slideIndex: number, slot: number, newTitle: string) => {
    if (!newTitle.trim()) return;

    const slideKeys = ['daily', 'weekly', 'monthly', 'yearly', 'fiveYear'];
    const slideKey = slideKeys[slideIndex];

    setAllGoals(prev => ({
      ...prev,
      [slideKey]: prev[slideKey].map((g: any) => 
        g.slot === slot ? { ...g, title: newTitle.trim() } : g
      )
    }));

    setEditingSlot(null);
    setEditText('');
  };

  const toggleGoal = (slideIndex: number, goalId: string) => {
    const slideKeys = ['daily', 'weekly', 'monthly', 'yearly', 'fiveYear'];
    const slideKey = slideKeys[slideIndex];

    setAllGoals(prev => ({
      ...prev,
      [slideKey]: prev[slideKey].map((g: any) => 
        g.id === goalId ? { ...g, done: !g.done } : g
      )
    }));
  };

  const linkToParent = (slideIndex: number, slot: number, parentGoalId: string) => {
    const slideKeys = ['daily', 'weekly', 'monthly', 'yearly', 'fiveYear'];
    const slideKey = slideKeys[slideIndex];

    setAllGoals(prev => ({
      ...prev,
      [slideKey]: prev[slideKey].map((g: any) => 
        g.slot === slot ? { ...g, linkedToParent: parentGoalId } : g
      )
    }));

    setShowLinkModal(null);
  };

  const getGoalForSlot = (slideIndex: number, slot: number) => {
    const slideKeys = ['daily', 'weekly', 'monthly', 'yearly', 'fiveYear'];
    const slideKey = slideKeys[slideIndex];
    return allGoals[slideKey as keyof typeof allGoals].find((g: any) => g.slot === slot);
  };

  const getParentGoal = (slideIndex: number, parentGoalId: string) => {
    const parentSlideKeys = ['weekly', 'monthly', 'yearly', 'fiveYear'];
    const parentSlideKey = parentSlideKeys[slideIndex];
    return allGoals[parentSlideKey as keyof typeof allGoals]?.find((g: any) => g.id === parentGoalId);
  };

  const getParentGoals = (slideIndex: number) => {
    const parentSlideKeys = ['weekly', 'monthly', 'yearly', 'fiveYear'];
    const parentSlideKey = parentSlideKeys[slideIndex];
    return allGoals[parentSlideKey as keyof typeof allGoals] || [];
  };

  const addMoreSlots = (slideIndex: number) => {
    const slideKeys = ['daily', 'weekly', 'monthly', 'yearly', 'fiveYear'];
    const slideKey = slideKeys[slideIndex];

    setMaxSlots(prev => ({
      ...prev,
      [slideKey]: prev[slideKey] + 1
    }));
  };

  // Save to localStorage whenever goals change
  useEffect(() => {
    // Save daily goals with today's date for history tracking
    const todayKey = formatDate(todayUTC(), 'yyyy-MM-dd');
    localStorage.setItem('daily-outcomes', JSON.stringify(allGoals.daily));
    localStorage.setItem(`daily-outcomes-${todayKey}`, JSON.stringify(allGoals.daily));
    
    localStorage.setItem(`weekly-goals-${weekKey}`, JSON.stringify(allGoals.weekly));
    localStorage.setItem('monthly-goals', JSON.stringify(allGoals.monthly));
    localStorage.setItem('yearly-goals', JSON.stringify(allGoals.yearly));
    localStorage.setItem('five-year-goals', JSON.stringify(allGoals.fiveYear));
  }, [allGoals, weekKey]);

  useEffect(() => {
    localStorage.setItem('daily-max-slots', maxSlots.daily.toString());
    localStorage.setItem(`weekly-max-slots-${weekKey}`, maxSlots.weekly.toString());
    localStorage.setItem('monthly-max-slots', maxSlots.monthly.toString());
    localStorage.setItem('yearly-max-slots', maxSlots.yearly.toString());
    localStorage.setItem('five-year-max-slots', maxSlots.fiveYear.toString());
  }, [maxSlots, weekKey]);

  const slides = [
    {
      title: "Today",
      subtitle: formatDate(todayUTC(), 'EEEE, MMMM d'),
      bgColor: 'bg-white',
      accentColor: 'text-red-500',
      progressColor: 'bg-red-500',
      goals: allGoals.daily,
      maxSlots: maxSlots.daily,
      key: 'daily',
      parentGoals: getParentGoals(0), // Weekly goals
      parentTitle: "This Week's Goals"
    },
    {
      title: "This Week",
      subtitle: `Week of ${formatDate(getWeekStart(), 'MMM d')}`,
      bgColor: 'bg-white',
      accentColor: 'text-orange-500',
      progressColor: 'bg-orange-500',
      goals: allGoals.weekly,
      maxSlots: maxSlots.weekly,
      key: 'weekly',
      parentGoals: getParentGoals(1), // Monthly goals
      parentTitle: "This Month's Goals"
    },
    {
      title: "This Month",
      subtitle: `${getMonthName()} ${getYear()}`,
      bgColor: 'bg-white',
      accentColor: 'text-green-500',
      progressColor: 'bg-green-500',
      goals: allGoals.monthly,
      maxSlots: maxSlots.monthly,
      key: 'monthly',
      parentGoals: getParentGoals(2), // Yearly goals
      parentTitle: "This Year's Goals"
    },
    {
      title: "This Year",
      subtitle: getYear().toString(),
      bgColor: 'bg-white',
      accentColor: 'text-blue-500',
      progressColor: 'bg-blue-500',
      goals: allGoals.yearly,
      maxSlots: maxSlots.yearly,
      key: 'yearly',
      parentGoals: getParentGoals(3), // 5-Year goals
      parentTitle: "5-Year Vision"
    },
    {
      title: "5-Year Vision",
      subtitle: `${getYear()} - ${getYear() + 4}`,
      bgColor: 'bg-white',
      accentColor: 'text-purple-500',
      progressColor: 'bg-purple-500',
      goals: allGoals.fiveYear,
      maxSlots: maxSlots.fiveYear,
      key: 'fiveYear',
      parentGoals: [],
      parentTitle: ""
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-4 py-6">
        <h1 className="text-2xl font-semibold text-gray-900 text-center tracking-tight">Focus</h1>
        <div className="flex justify-center mt-3 space-x-1.5">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                index === currentSlide ? 'bg-blue-500 scale-125' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Carousel */}
      <div 
        className="relative h-full"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg hover:shadow-xl hover:bg-white transition-all duration-200"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg hover:shadow-xl hover:bg-white transition-all duration-200"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>

        {/* Slides Container */}
        <div 
          ref={carouselRef}
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, slideIndex) => {
            const progress = getProgressForHorizon(slide.goals);
            const priorityProgress = getPriorityProgress(slide.goals);
            const hasWin = getWinStatus(slide.goals);
            
            return (
              <div key={slide.key} className="w-full flex-shrink-0 px-6 py-8">
                <div className={`${slide.bgColor} rounded-3xl shadow-sm border border-gray-200/50 p-8 h-full flex flex-col`}>
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <h2 className={`text-3xl font-semibold ${slide.accentColor} tracking-tight`}>
                        {slide.title}
                      </h2>
                      {hasWin && (
                        <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                          <Trophy size={14} />
                          <span className="text-xs font-medium">WIN</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-500 text-lg font-medium">{slide.subtitle}</p>
                  </div>


                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-600 font-medium text-sm">Priority Progress</span>
                      <span className={`${slide.accentColor} text-2xl font-semibold`}>{priorityProgress}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${slide.progressColor} rounded-full h-2 transition-all duration-500 ease-out`}
                        style={{ width: `${priorityProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Goals List */}
                  <div className="flex-1 space-y-3 overflow-y-auto">
                    {Array.from({ length: slide.maxSlots }, (_, i) => i + 1).map((slot) => {
                      const goal = getGoalForSlot(slideIndex, slot);
                      const isEditing = editingSlot?.slide === slideIndex && editingSlot?.slot === slot;
                      const isPriority = slot <= 3;
                      const isOptional = slot > 3;
                      const parentGoal = goal?.linkedToParent ? getParentGoal(slideIndex, goal.linkedToParent) : null;
                      
                      return (
                        <div 
                          key={slot} 
                          className={`rounded-2xl p-4 transition-all duration-200 ${
                            isPriority 
                              ? 'bg-gray-50 border border-gray-200/50' 
                              : 'bg-gray-25 border border-gray-100/50'
                          }`}
                        >
                          {/* Priority indicator */}
                          {isPriority && (
                            <div className="flex items-center space-x-2 mb-3">
                              <div className={`w-1.5 h-1.5 ${slide.progressColor} rounded-full`}></div>
                              <span className="text-gray-500 text-xs font-medium tracking-wide">PRIORITY</span>
                            </div>
                          )}
                          
                          {isOptional && (
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                              <span className="text-gray-400 text-xs font-medium tracking-wide">OPTIONAL</span>
                            </div>
                          )}

                          {goal ? (
                            <div className="space-y-3">
                              <div className="flex items-center space-x-4">
                                <button
                                  onClick={() => toggleGoal(slideIndex, goal.id)}
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                    goal.done
                                      ? `${slide.progressColor} border-transparent`
                                      : isPriority 
                                        ? 'border-gray-400 hover:border-gray-500' 
                                        : 'border-gray-300 hover:border-gray-400'
                                  }`}
                                >
                                  {goal.done && <Check size={14} className="text-white" />}
                                </button>
                                {isEditing ? (
                                  <div className="flex-1 flex items-center space-x-2">
                                    <input
                                      type="text"
                                      value={editText}
                                      onChange={(e) => setEditText(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleEditGoal(slideIndex, slot, editText);
                                        } else if (e.key === 'Escape') {
                                          setEditingSlot(null);
                                          setEditText('');
                                        }
                                      }}
                                      className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleEditGoal(slideIndex, slot, editText)}
                                      className="text-green-500 hover:text-green-600 transition-colors"
                                    >
                                      <Check size={16} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingSlot(null);
                                        setEditText('');
                                      }}
                                      className="text-red-500 hover:text-red-600 transition-colors"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                ) : (
                                  <span 
                                    className={`flex-1 cursor-pointer transition-colors ${
                                      goal.done 
                                        ? 'line-through text-gray-400' 
                                        : isPriority 
                                          ? 'text-gray-900' 
                                          : 'text-gray-600'
                                    }`}
                                    onClick={() => {
                                      setEditText(goal.title);
                                      setEditingSlot({ slide: slideIndex, slot });
                                    }}
                                  >
                                    {goal.title}
                                  </span>
                                )}
                              </div>

                              {/* Parent Goal Link */}
                              {slideIndex < 4 && (
                                <div className="ml-10">
                                  {parentGoal ? (
                                    <div className="flex items-center space-x-2">
                                      <LinkIcon size={12} className="text-blue-500" />
                                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                        🔗 {parentGoal.title}
                                      </span>
                                      <button
                                        onClick={() => setShowLinkModal({ slide: slideIndex, slot })}
                                        className="text-xs text-gray-400 hover:text-gray-600"
                                      >
                                        Change
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setShowLinkModal({ slide: slideIndex, slot })}
                                      className="text-xs text-blue-500 hover:text-blue-600 flex items-center space-x-1"
                                    >
                                      <LinkIcon size={10} />
                                      <span>Link to {slide.parentTitle.toLowerCase()}</span>
                                    </button>
                                  )}

                                  {/* Inline Parent Goals Selector */}
                                  {showLinkModal?.slide === slideIndex && showLinkModal?.slot === slot && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-gray-600">Choose parent goal:</span>
                                        <button
                                          onClick={() => setShowLinkModal(null)}
                                          className="text-gray-400 hover:text-gray-600"
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {slide.parentGoals?.map((parentGoal: any) => (
                                          <button
                                            key={parentGoal.id}
                                            onClick={() => linkToParent(slideIndex, slot, parentGoal.id)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                              parentGoal.done 
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                          >
                                            {parentGoal.title}
                                          </button>
                                        ))}
                                        {(!slide.parentGoals || slide.parentGoals.length === 0) && (
                                          <span className="text-xs text-gray-500 italic">
                                            No parent goals set yet
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              {isEditing ? (
                                <div className="flex-1 flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleAddGoal(slideIndex, slot);
                                      } else if (e.key === 'Escape') {
                                        setEditingSlot(null);
                                        setEditText('');
                                      }
                                    }}
                                    placeholder={`What do you want to achieve ${slide.key === 'daily' ? 'today' : slide.key === 'weekly' ? 'this week' : slide.key === 'monthly' ? 'this month' : slide.key === 'yearly' ? 'this year' : 'in 5 years'}?`}
                                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleAddGoal(slideIndex, slot)}
                                    className="text-green-500 hover:text-green-600 transition-colors"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingSlot(null);
                                      setEditText('');
                                    }}
                                    className="text-red-500 hover:text-red-600 transition-colors"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span className={`${isPriority ? 'text-gray-500' : 'text-gray-400'} text-sm`}>
                                    No goal set
                                  </span>
                                  <button
                                    onClick={() => setEditingSlot({ slide: slideIndex, slot })}
                                    className={`flex items-center space-x-1 transition-colors ${
                                      isPriority 
                                        ? 'text-blue-500 hover:text-blue-600' 
                                        : 'text-gray-400 hover:text-gray-500'
                                    }`}
                                  >
                                    <Plus size={16} />
                                    <span className="text-sm font-medium">Add</span>
                                  </button>
                                </>
                              )}

                              {/* Parent Goal Link for new goals */}
                              {slideIndex < 4 && !goal && (
                                <div className="ml-10 mt-2">
                                  <button
                                    onClick={() => setShowLinkModal({ slide: slideIndex, slot })}
                                    className="text-xs text-blue-500 hover:text-blue-600 flex items-center space-x-1"
                                  >
                                    <LinkIcon size={10} />
                                    <span>Link to {slide.parentTitle.toLowerCase()}</span>
                                  </button>

                                  {/* Inline Parent Goals Selector for new goals */}
                                  {showLinkModal?.slide === slideIndex && showLinkModal?.slot === slot && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-gray-600">Choose parent goal:</span>
                                        <button
                                          onClick={() => setShowLinkModal(null)}
                                          className="text-gray-400 hover:text-gray-600"
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {slide.parentGoals?.map((parentGoal: any) => (
                                          <button
                                            key={parentGoal.id}
                                            onClick={() => linkToParent(slideIndex, slot, parentGoal.id)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                              parentGoal.done 
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                          >
                                            {parentGoal.title}
                                          </button>
                                        ))}
                                        {(!slide.parentGoals || slide.parentGoals.length === 0) && (
                                          <span className="text-xs text-gray-500 italic">
                                            No parent goals set yet
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {slide.maxSlots < 5 && (
                      <div 
                        className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-4 cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
                        onClick={() => addMoreSlots(slideIndex)}
                      >
                        <div className="flex items-center justify-center space-x-2 text-gray-500">
                          <Plus size={20} />
                          <span className="font-medium text-sm">Add 1 more goal</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
