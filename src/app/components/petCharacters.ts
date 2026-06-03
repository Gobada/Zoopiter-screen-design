import type { ComponentType, CSSProperties } from "react";
import { Zoopi } from "./Zoopi";
import { Zoovi } from "./Zoovi";

export type PetCharacterKey = "zoopi" | "zoovi";

// 캐릭터 키 → 컴포넌트 레지스트리.
// 새 캐릭터를 추가할 때는 (1) 컴포넌트 파일 생성 후 (2) 여기에 한 줄 추가하면 된다.
export const PET_CHARACTER_COMPONENTS: Record<
  PetCharacterKey,
  ComponentType<{ style?: CSSProperties }>
> = {
  zoopi: Zoopi,
  zoovi: Zoovi,
};

// 펫 id → 기본 캐릭터 매핑.
// 이름(주피/주비)이 아니라 변하지 않는 id에 묶여 있으므로,
// 사용자가 이름을 바꿔도 사진을 직접 교체하기 전까지 원래 SVG가 유지된다.
// (등록되지 않은 새 펫 id는 기본값 "zoopi" 사용)
export const DEFAULT_PET_CHARACTER: Record<string, PetCharacterKey> = {
  buddy: "zoopi",
  bappe: "zoovi",
};

export function resolvePetCharacter(petId?: string): PetCharacterKey {
  return (petId && DEFAULT_PET_CHARACTER[petId]) || "zoopi";
}
