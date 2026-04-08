import { Options } from "./types";

export const keys = {
  eventParticipations: {
    all: ["eventParticipations"] as const,
    list: (options?: Options) => ["eventParticipations", "list", options] as const,
  },
  appointments: {
    all: ["appointments"] as const,
    list: (options?: Options) => ["appointments", "list", options] as const,
  },
  library: {
    all: ["library"] as const,
    list: (options?: Options) => ["library", "list", options] as const,
  },
};
