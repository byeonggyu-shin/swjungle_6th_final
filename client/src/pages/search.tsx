import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
// Components
import NavBar from "@/features/Header/NavBar";
import SearchBar from "@/features/Search/SearchBar";
import Card from "@/features/Search/Card";
// Assets
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";

const randomColors = [
  "#EE6565",
  "#FB8351",
  "#FAC858",
  "#91CB75",
  "#3AA272",
  "#73C0DE",
  "#5470C6",
  "#9A60B4",
  "#FF88E0",
];

export default function Search() {
  const router = useRouter();
  const [clickedTag, setClickedTag] = useState("");
  const [taglist, setTaglist] = useState([]);
  const [cardlist, setCardlist] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage] = useState(14);
  const [totalCards, setTotalCards] = useState(cardlist.length);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
    }
  }, []);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const keyword = router.query.search;
        const response = await axios.get("api/search/tags", {
          params: {
            keyword,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setTaglist(response.data.result);
      } catch (error) {
        console.error("API error:", error);
      }
    };

    if (router.query.search) {
      fetchData();
    }
  }, [router.query.search]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await axios.post(
          "api/search/cards",
          {
            tag: clickedTag,
            page: currentPage,
            perPage: cardsPerPage,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setCardlist(response.data.result);
        setTotalCards(response.data.totalResults);
      } catch (error) {
        console.error("API error:", error);
      }
    };

    if (clickedTag) {
      setCardlist([]); // Clear the cardlist before fetching new results
      fetchCards();
    }
  }, [clickedTag, currentPage]);

  const handleSearch = (value: string) => {
    console.log("Search value:", value);

    if (value.trim() === "") {
      alert("검색어를 입력하세요.");
      return;
    }

    axios
      .get("api/search/tags", {
        params: {
          keyword: value,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setTaglist(response.data.result);
      })
      .catch((error) => {
        console.error("API error:", error);
      });
  };

  const handleExpandClick = (cardId: number) => {
    console.log("Clicked card id:", cardId);
  };

  const handleTagClick = (tag: string) => {
    console.log("Clicked tag:", tag);
    setClickedTag(tag);
    setCurrentPage(1); // Reset currentPage to 1
  };

  return (
    <>
      <div className="h-screen max-w-[75rem] mx-auto">
        <NavBar />
        <div>
          <div className="flex justify-center items-end w-[75rem] h-[6.5rem]">
            <div className="w-[1200px] h-[104px] p-0 flex justify-center items-end">
              {/* search bar */}
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>

          <div className="flex flex-col items-start w-[75rem] py-[3.75rem] px-0 gap-[3.75rem]">
            {taglist.length != 0 && (
              <div className="flex flex-col gap-[2rem] items-start self-stretch pt-0 pr-0 pb-10 pl-0 border-b border-[#181818] shadow-1 mb-[0.5rem]">
                <div className="text-[#181818] leading-trim tracking-tight-[-0.015rem] text-capitalize text-[1.5rem] font-[600] leading-[150%]">
                  in Tags
                </div>
                <div className="flex items-start gap-[1rem] flex-wrap">
                  {taglist.map((tag, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-center h-[2.25rem] py-0 px-[1rem] rounded-[0.25rem] cursor-pointer`}
                      style={{
                        backgroundColor:
                          randomColors[
                            Math.floor(Math.random() * randomColors.length)
                          ],
                      }}
                      onClick={() => handleTagClick(tag)}
                    >
                      <span className="text-white font-kanit font-[1.25rem] font-[600] leading-[150%] tracking-[0.0375rem]">
                        # {tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {cardlist.length != 0 && (
              <div className="flex flex-col items-start gap-[2rem] self-stretch pb-[2.5rem] border-b border-[#181818] shadow-1 mb-[0.5rem]">
                <div className="text-[#181818] leading-trim tracking-tight-[-0.015rem] text-capitalize text-[1.5rem] font-[600] leading-[150%]">
                  in Cards
                </div>

                <div className="flex flex-col items-start gap-[1rem] self-stretch">
                  <div className="flex items-center self-stretch justify-between">
                    <>
                      <div className="flex items-center justify-center h-[2.25rem] py-0 px-[1rem] rounded-[0.25rem] bg-[#5470C6] cursor-pointer">
                        <span className="text-white font-kanit font-[1.25rem] font-[600] leading-[150%] tracking-[0.0375rem]">
                          # {clickedTag}
                        </span>
                      </div>
                      {/* 페이지 네이션 */}
                      <div className="flex items-center gap-[0.5rem]">
                        <div className="text-[#181818] text-[0.875rem]  font-weight-[300] leading-[160%] tracking-[-0.02625rem]">
                          {`${Math.min(
                            (currentPage - 1) * cardsPerPage + 1,
                            totalCards
                          )} - ${Math.min(
                            currentPage * cardsPerPage,
                            totalCards
                          )} of ${totalCards}`}
                        </div>
                        <div
                          className={`flex items-center justify-center w-[1.75rem] h-[1.75rem] rounded-md bg-[#FFF]  cursor-pointer${
                            currentPage === 1
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={() =>
                            currentPage > 1 && handlePageChange(currentPage - 1)
                          }
                        >
                          <AiOutlineLeft />
                        </div>
                        <div className="text-[#181818] text-[0.875rem]  font-weight-[300] leading-[160%] tracking-[-0.02625rem]">
                          {`${currentPage} / ${Math.ceil(
                            totalCards / cardsPerPage
                          )}`}
                        </div>
                        <div
                          className={`flex items-center justify-center w-[1.75rem] h-[1.75rem] rounded-md bg-[#FFF] cursor-pointer ${
                            currentPage === Math.ceil(totalCards / cardsPerPage)
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={() =>
                            currentPage <
                              Math.ceil(totalCards / cardsPerPage) &&
                            handlePageChange(currentPage + 1)
                          }
                        >
                          <AiOutlineRight />
                        </div>
                      </div>
                    </>
                  </div>
                  <div className="flex items-start content-start gap-[0.75rem] flex-1 self-stretch flex-wrap">
                    {cardlist &&
                      cardlist.map((card: { id: number }, index: number) => {
                        return (
                          <Card
                            key={index}
                            card={card}
                            handleExpandClick={handleExpandClick}
                          />
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
