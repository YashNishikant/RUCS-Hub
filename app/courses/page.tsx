import CourseTable from "@/components/course-table/course_table";
import CourseListingHeader from "@/components/course-table/course_table_header";
import {
  fetchAllCourseTableListings,
  fetchCourseTableListingByYear,
  fetchCourseTableListingsByTerm,
  fetchCourseTableListingsByYearTerm,
} from "@/lib/data/course";
import { CourseTableColumn } from "@/lib/definitions/course";
import { getTermByName } from "@/lib/utils";

export default async function Page({ searchParams }: { searchParams: string }) {
  const params = new URLSearchParams(searchParams);
  const year = params.get("year") ? Number(params.get("year")) : null;
  const term = getTermByName(params.get("term") || "");

  console.log(`Year from params: ${params.get("year")}`);

  console.log(`Year: ${year}`);
  console.log(`Term: ${term}`);

  let courseTableData: CourseTableColumn[] = [];
  if (year !== null && term !== null) {
    courseTableData = await fetchCourseTableListingsByYearTerm(year, term);
  } else if (term !== null && year === null) {
    courseTableData = await fetchCourseTableListingsByTerm(term);
  } else if (term === null && year !== null) {
    courseTableData = await fetchCourseTableListingByYear(year);
    console.log("Year");
  } else {
    courseTableData = await fetchAllCourseTableListings();
  }

  return (
    <div className="flex flex-col place-items-center justify-center space-y-4">
      <CourseListingHeader />
      <CourseTable data={courseTableData} />
    </div>
  );
}
