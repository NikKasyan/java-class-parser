import { Version } from "./types/version";

const versionsString = `1.0.2 May 1996 45 45
1.1 February 1997 45 45
1.2 December 1998 46 45 .. 46
1.3 May 2000 47 45 .. 47
1.4 February 2002 48 45 .. 48
5.0 September 2004 49 45 .. 49
6 December 2006 50 45 .. 50
7 July 2011 51 45 .. 51
8 March 2014 52 45 .. 52
9 September 2017 53 45 .. 53
10 March 2018 54 45 .. 54
11 September 2018 55 45 .. 55
12 March 2019 56 45 .. 56
13 September 2019 57 45 .. 57
14 March 2020 58 45 .. 58
15 September 2020 59 45 .. 59
16 March 2021 60 45 .. 60
17 September 2021 61 45 .. 61
18 March 2022 62 45 .. 62
19 September 2022 63 45 .. 63
20 March 2023 64 45 .. 64
21 September 2023 65 45 .. 65
22 March 2024 66 45 .. 66` as const;

type VersionKey<T extends string> = `JAVA_${T}`;

type ExtractVersionConstants<
  T extends string,
  Acc extends string[] = []
> = T extends `${infer Line}\n${infer Rest}`
  ? ExtractVersionConstants<Rest, [...Acc, Line]>
  : Acc;

type ReplaceDots<T extends string> = T extends `${infer First}.${infer Rest}`
  ? `${First}_${ReplaceDots<Rest>}`
  : T;

type JoinVersionConstants<T extends string[]> = T extends [
  infer First,
  ...infer Rest extends string[]
]
  ? First extends `${infer VersionName} ${infer _}`
    ? VersionKey<ReplaceDots<VersionName>> | JoinVersionConstants<Rest>
    : never
  : never;

type JavaVersionString = typeof versionsString;

type JavaVersionConstants = JoinVersionConstants<
  ExtractVersionConstants<JavaVersionString>
>;

type JavaVersions = {
  [K in JavaVersionConstants]: Version;
};
//JAVA SE Released Major Supported Majors
const VERSIONS_INTERNAL = versionsString.split("\n").map((v) => {
  const [version, releaseMonth, releaseYear, major] = v.split(" ");
  return {
    version,
    releaseMonth,
    releaseYear: parseInt(releaseYear),
    major: parseInt(major),
  };
});

export const Versions = VERSIONS_INTERNAL.reduce((acc, v) => {
  const key = `JAVA_${v.version.replace(/\./g, "_")}` as keyof JavaVersions;
  acc[key] = v;
  return acc;
}, {} as JavaVersions);

export const getJavaVersionByMajor = (major: number): Version => {
  return (
    VERSIONS_INTERNAL.find((v) => v.major === major) || {
      version: "Unknown",
      major: 0,
      releaseYear: 0,
      releaseMonth: "Unknown",
    }
  );
};
