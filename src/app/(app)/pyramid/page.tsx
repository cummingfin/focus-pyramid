'use client';

import { useState, useEffect, useRef } from 'react';
import { formatDate, todayUTC, getWeekStart, getMonthName, getYear } from '@/lib/dates';
import { Check, Plus, X, Link as LinkIcon, ChevronLeft, ChevronRight } from 'lucide-react';

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

  const getGoalForSlot = (slideIndex: number, slot: number) => {
    const slideKeys = ['daily', 'weekly', 'monthly', 'yearly', 'fiveYear'];
    const slideKey = slideKeys[slideIndex];
    return allGoals[slideKey as keyof typeof allGoals].find((g: any) => g.slot === slot);
  };

  const addMoreSlots = (slideIndex: number) => {
    const slideKeys = ['daily', 'weekly', 'monthly', 'yearly', 'fiveYear'];
    const slideKey = slideKeys[slideIndex];

    setMaxSlots(prev => ({
      ...prev,
      [slideKey]: 5
    }));
  };

  // Save to localStorage whenever goals change
  useEffect(() => {
    localStorage.setItem('daily-outcomes', JSON.stringify(allGoals.daily));
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
      title: "Today's Focus",
      subtitle: formatDate(todayUTC(), 'EEEE, MMMM do'),
      color: 'bg-gradient-to-br from-red-500 to-red-700',
      goals: allGoals.daily,
      maxSlots: maxSlots.daily,
      key: 'daily'
    },
    {
      title: "Weekly Goals",
      subtitle: `Week of ${formatDate(getWeekStart(), 'MMM dd')}`,
      color: 'bg-gradient-to-br from-orange-500 to-orange-700',
      goals: allGoals.weekly,
      maxSlots: maxSlots.weekly,
      key: 'weekly'
    },
    {
      title: "Monthly Goals",
      subtitle: `${getMonthName()} ${getYear()}`,
      color: 'bg-gradient-to-br from-green-500 to-green-700',
      goals: allGoals.monthly,
      maxSlots: maxSlots.monthly,
      key: 'monthly'
    },
    {
      title: "Yearly Goals",
      subtitle: getYear().toString(),
      color: 'bg-gradient-to-br from-blue-500 to-blue-700',
      goals: allGoals.yearly,
      maxSlots: maxSlots.yearly,
      key: 'yearly'
    },
    {
      title: "5-Year Vision",
      subtitle: `${getYear()}-${getYear() + 4}`,
      color: 'bg-gradient-to-br from-purple-500 to-purple-700',
      goals: allGoals.fiveYear,
      maxSlots: maxSlots.fiveYear,
      key: 'fiveYear'
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
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900 text-center">Focus Pyramid</h1>
        <div className="flex justify-center mt-2 space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
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
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
        >
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
        >
          <ChevronRight size={24} className="text-gray-600" />
        </button>

        {/* Slides Container */}
        <div 
          ref={carouselRef}
          className="flex h-full transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, slideIndex) => {
            const progress = getProgressForHorizon(slide.goals);
            
            return (
              <div key={slide.key} className="w-full flex-shrink-0 px-6 py-6">
                <div className={`${slide.color} rounded-2xl p-6 h-full flex flex-col shadow-xl`}>
                  {/* Header */}
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">{slide.title}</h2>
                    <p className="text-white/80 text-lg">{slide.subtitle}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">Progress</span>
                      <span className="text-white text-2xl font-bold">{progress}%</span>
                    </div>
                    <div className="bg-white/20 rounded-full h-3">
                      <div 
                        className="bg-white rounded-full h-3 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Goals List */}
                  <div className="flex-1 space-y-3 overflow-y-auto">
                    {Array.from({ length: slide.maxSlots }, (_, i) => i + 1).map((slot) => {
                      const goal = getGoalForSlot(slideIndex, slot);
                      const isEditing = editingSlot?.slide === slideIndex && editingSlot?.slot === slot;
                      
                      return (
                        <div key={slot} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                          {goal ? (
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => toggleGoal(slideIndex, goal.id)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                  goal.done
                                    ? 'bg-white border-white'
                                    : 'border-white/60 hover:border-white'
                                }`}
                              >
                                {goal.done && <Check size={14} className="text-blue-600" />}
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
                                    className="flex-1 px-3 py-2 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-900"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleEditGoal(slideIndex, slot, editText)}
                                    className="text-white hover:text-white/80"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingSlot(null);
                                      setEditText('');
                                    }}
                                    className="text-white hover:text-white/80"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ) : (
                                <span 
                                  className={`flex-1 text-white cursor-pointer ${
                                    goal.done ? 'line-through opacity-70' : ''
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
                                    className="flex-1 px-3 py-2 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-900"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleAddGoal(slideIndex, slot)}
                                    className="text-white hover:text-white/80"
                                  >
                                    <Check size={16} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingSlot(null);
                                      setEditText('');
                                    }}
                                    className="text-white hover:text-white/80"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span className="text-white/60">No goal set for slot {slot}</span>
                                  <button
                                    onClick={() => setEditingSlot({ slide: slideIndex, slot })}
                                    className="flex items-center space-x-1 text-white hover:text-white/80"
                                  >
                                    <Plus size={16} />
                                    <span>Add</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {slide.maxSlots < 5 && (
                      <div 
                        className="bg-white/10 backdrop-blur-sm border-2 border-dashed border-white/30 rounded-lg p-4 cursor-pointer hover:bg-white/20 transition-colors"
                        onClick={() => addMoreSlots(slideIndex)}
                      >
                        <div className="flex items-center justify-center space-x-2 text-white/80">
                          <Plus size={20} />
                          <span className="font-medium">Add 2 more goals</span>
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
