import { publicApi } from "@/lib/api";

export const generalService = {
    addToWaitlist: (email: string) => 
        publicApi.post('/waitlist', { email }),
}