'use client';

import React, { useState, useCallback, useMemo, memo } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock, Sparkles, Briefcase, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { TimeSelector } from "./TimeSelector";
import { TimeState } from '@/types/globalTypes';
import { DURATION_OPTIONS, EXPERIENCE_LEVELS } from "@/constants/index";
import { toast } from 'sonner';
import { DialogDescription } from '@radix-ui/react-dialog';
import { interviewFormSchema } from '@/schemas';


type FormData = z.infer<typeof interviewFormSchema>;

interface CreateInterviewModalProps {
    children: React.ReactNode;
}
const DEFAULT_TIME: TimeState = { hour: "09", minute: "00" };

export const CreateInterviewModal = memo<CreateInterviewModalProps>(({
    children,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedTime, setSelectedTime] = useState<TimeState>(DEFAULT_TIME);
    const isPaidUser = false;
    const formConfig = useMemo(() => ({
        resolver: zodResolver(interviewFormSchema),
        defaultValues: {
            jobTitle: "",
            techStack: "",
            experienceLevel: "",
            callDuration: 5,
            additionalPrompt: "",
            schedule: interviewFormSchema.shape.schedule.enum.now,
            scheduledDate: undefined,
        },
    }), []);

    const form = useForm<FormData>(formConfig);

    const handleModalClose = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleScheduleChange = useCallback((value: string) => {
        setShowCalendar(value === "future");
    }, []);

    const handleTimeChange = useCallback((time: TimeState) => {
        setSelectedTime(time);
    }, []);

    const resetForm = useCallback(() => {
        form.reset();
        setShowCalendar(false);
        setSelectedTime(DEFAULT_TIME);
    }, [form]);

    const handleSubmit = useCallback(async (data: FormData) => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            if (data.schedule === "future" && data.scheduledDate) {
                const combinedDateTime = new Date(data.scheduledDate);
                combinedDateTime.setHours(parseInt(selectedTime.hour));
                combinedDateTime.setMinutes(parseInt(selectedTime.minute));
                data.scheduledDate = combinedDateTime;
            }
            const { data: axiosData } = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/interview`, data, {
                withCredentials: true
            })
            if (axiosData.success) {
                setIsOpen(false);
                resetForm();
                toast.success(axiosData.message || "Interview created")
            }
        } catch (error) {
            console.error('Error creating interview:', error);
            toast.error("Failed to create interview. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }, [isSubmitting, selectedTime, resetForm]);

    const buttonText = useMemo(() => {
        const selectedDate = form.watch('scheduledDate');
        return selectedDate ?
            `${format(selectedDate, "PPP")} at ${selectedTime.hour}:${selectedTime.minute}` :
            "Pick a date & time";
    }, [form, selectedTime.hour, selectedTime.minute]);

    const availableDurations = useMemo(() =>
        isPaidUser ? DURATION_OPTIONS : DURATION_OPTIONS.filter(option => option.free),
        [isPaidUser]
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>

            <DialogContent
                className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto border-[color:var(--border)] [&>button:last-child]:hidden"
                style={{ background: 'var(--surface)' }}
            >
                <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="rounded-full p-2 bg-indigo-500/10">
                            <Briefcase className="h-5 w-5 text-[color:var(--indigo)]" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-[color:var(--text)]">
                            Create New Interview
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-[color:var(--text-dim)]">
                        Set up your AI-powered interview session with custom parameters
                    </DialogDescription>

                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* Job Title */}
                        <FormField
                            control={form.control}
                            name="jobTitle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[color:var(--text)]">Job Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. Senior React Developer"
                                            className="border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--text)] placeholder:text-[color:var(--text-dim)]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Tech Stack */}
                        <FormField
                            control={form.control}
                            name="techStack"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[color:var(--text)]">Tech Stack</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. React, Node.js, TypeScript, AWS"
                                            className="border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--text)] placeholder:text-[color:var(--text-dim)]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Experience Level */}
                        <FormField
                            control={form.control}
                            name="experienceLevel"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[color:var(--text)]">Experience Level</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--text)]">
                                                <SelectValue placeholder="Select experience level" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="border-[color:var(--border)] bg-[color:var(--surface)]">
                                            {EXPERIENCE_LEVELS.map((level) => (
                                                <SelectItem
                                                    key={level.value}
                                                    value={level.value}
                                                    className="text-[color:var(--text)] hover:bg-indigo-500/10 focus:bg-indigo-500/10"
                                                >
                                                    {level.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Call Duration */}
                        <FormField
                            control={form.control}
                            name="callDuration"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-[color:var(--text)]">
                                        <Clock className="h-4 w-4" />
                                        Call Duration
                                        {!isPaidUser && (
                                            <Badge className="text-xs bg-[color:var(--coral)]/10 text-[color:var(--coral)] border border-[color:var(--coral)]/20">
                                                Free: 5 min only
                                            </Badge>
                                        )}
                                    </FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(parseInt(value))}
                                        defaultValue={field.value.toString()}
                                        disabled={!isPaidUser}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--text)] disabled:opacity-50">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="border-[color:var(--border)] bg-[color:var(--surface)]">
                                            {availableDurations.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value.toString()}
                                                    className="text-[color:var(--text)] hover:bg-indigo-500/10 focus:bg-indigo-500∏/10"
                                                >
                                                    <div className="flex items-center justify-between w-full">
                                                        <span>{option.label}</span>
                                                        {!option.free && (
                                                            <Badge className="ml-2 text-xs bg-[color:var(--mint)]/10 text-[color:var(--mint)]">
                                                                Pro
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Schedule */}
                        <FormField
                            control={form.control}
                            name="schedule"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-[color:var(--text)]">
                                        <CalendarIcon className="h-4 w-4" />
                                        Schedule
                                    </FormLabel>
                                    <Select onValueChange={(value) => {
                                        field.onChange(value);
                                        handleScheduleChange(value);
                                    }} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--text)]">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="border-[color:var(--border)] bg-[color:var(--surface)]">
                                            <SelectItem value="now" className="text-[color:var(--text)] hover:bg-indigo-500/10">
                                                Start Now
                                            </SelectItem>
                                            <SelectItem value="future" className="text-[color:var(--text)] hover:bg-indigo-500/10">
                                                Schedule for Later
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Conditional Date & Time Picker */}
                        {showCalendar && (
                            <FormField
                                control={form.control}
                                name="scheduledDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[color:var(--text)]">Select Date & Time</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-start text-left font-normal border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--text)]"
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {buttonText}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 border-[color:var(--border)] bg-[color:var(--surface)]" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date < new Date()}
                                                    autoFocus
                                                    className="text-[color:var(--text)]"
                                                />
                                                <TimeSelector
                                                    selectedTime={selectedTime}
                                                    onTimeChange={handleTimeChange}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Additional Prompt */}
                        <FormField
                            control={form.control}
                            name="additionalPrompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 text-[color:var(--text)]">
                                        <Sparkles className="h-4 w-4 text-[color:var(--mint)]" />
                                        Additional AI Prompt (Optional)
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g. Focus on system design patterns, include behavioral questions..."
                                            className="border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--text)] placeholder:text-[color:var(--text-dim)] min-h-[80px] resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <p className="text-xs text-[color:var(--text-dim)]">
                                        Give the AI specific instructions about what to focus on during the interview
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Actions */}
                        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleModalClose}
                                disabled={isSubmitting}
                                className="border-[color:var(--border)] text-[color:var(--text)] hover:bg-[color:var(--border)]/10"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 sm:flex-none text-[#0E1116] font-semibold disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg, var(--indigo), var(--coral))' }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-[#0E1116]/20 border-t-[#0E1116] rounded-full animate-spin mr-2" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Briefcase className="h-4 w-4 mr-2" />
                                        Create Interview
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
});

CreateInterviewModal.displayName = 'CreateInterviewModal';
