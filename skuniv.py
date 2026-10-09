import time
import random
import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup

# ==================================
# 클러스터별 직무 키워드
# ==================================
CLUSTER_KEYWORDS = {
    "cluster_frontend": [
        "프론트엔드 개발자", "웹 개발자", "UI 개발자"
    ],
    "cluster_backend": [
        "백엔드 개발자", "서버 개발자", "API 개발자"
    ],
    "cluster_ai": [
        "AI 엔지니어", "머신러닝 엔지니어", "데이터 엔지니어"
    ],
    "cluster_system": [
        "시스템 엔지니어", "네트워크 엔지니어", "임베디드 개발자"
    ],
    "cluster_game": [
        "게임 개발자", "게임 엔진 개발자"
    ],
    "cluster_security": [
        "보안 엔지니어", "정보보안"
    ]
}

MAX_PER_JOB = 10          # 🔥 직무(검색어)당 최대 수
SCROLL_COUNT = 3          # 스크롤 최소화

# ==================================
# Selenium Driver
# ==================================
def get_driver():
    options = Options()
    options.add_argument("--window-size=1920x1080")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("user-agent=Mozilla/5.0")

    return webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )

# ==================================
# 크롤링 함수
# ==================================
def crawl_saramin_limited(cluster_keywords):
    driver = get_driver()
    results = []
    visited = set()

    for cluster, keywords in cluster_keywords.items():
        print(f"\n🚀 {cluster} 시작")

        for kw in keywords:
            print(f"  🔍 검색어: {kw}")
            url = f"https://www.saramin.co.kr/zf_user/search?searchword={kw}"
            driver.get(url)
            time.sleep(3)

            # 최소 스크롤
            for _ in range(SCROLL_COUNT):
                driver.execute_script(
                    "window.scrollTo(0, document.body.scrollHeight);"
                )
                time.sleep(2)

            soup = BeautifulSoup(driver.page_source, "html.parser")
            cards = soup.select("div.item_recruit")

            count = 0
            for card in cards:
                if count >= MAX_PER_JOB:
                    break

                try:
                    title = card.select_one(".job_tit").get_text(strip=True)
                    company = card.select_one(".corp_name").get_text(strip=True)
                    detail_url = "https://www.saramin.co.kr" + card.select_one("a")["href"]
                except:
                    continue

                if detail_url in visited:
                    continue
                visited.add(detail_url)

                try:
                    region = card.select_one(".job_condition").get_text(" ", strip=True)
                except:
                    region = ""

                try:
                    date = card.select_one(".job_date .date").get_text(strip=True)
                except:
                    date = ""

                results.append([
                    cluster, kw, title, company, region, date, detail_url
                ])

                count += 1

            # 🔥 사람처럼 쉬어주기
            time.sleep(3 + random.random() * 2)

    driver.quit()

    df = pd.DataFrame(results, columns=[
        "cluster", "search_keyword",
        "job_title", "company",
        "region", "date", "url"
    ])

    df.to_csv("saramin_cluster_limited.csv", encoding="utf-8-sig", index=False)

    print("\n✅ 크롤링 완료")
    print(f"총 수집 공고 수: {len(df)}")
    print("📄 saramin_cluster_limited.csv 저장됨")

    return df

# ==================================
# main
# ==================================
if __name__ == "__main__":
    crawl_saramin_limited(CLUSTER_KEYWORDS)
