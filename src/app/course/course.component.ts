import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CoursesService} from "../services/courses.service";
import {Course} from "../model/course";
import {Lesson} from "../model/lesson";
import {combineLatest, Observable} from "rxjs";
import {map, startWith} from "rxjs/operators";

interface CourseData {
  course: Course;
  lessons: Lesson[];
}


@Component({
  selector: 'course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CourseComponent implements OnInit {

  // single data observable pattern
  data$: Observable<CourseData>;

  constructor(private route: ActivatedRoute,
              private coursesService: CoursesService) {
  }

  ngOnInit() {
    const courseId = parseInt(this.route.snapshot.paramMap.get("courseId"));

    const course$ = this.coursesService.loadCourseById(courseId).pipe(startWith(null));
    const lessons$ = this.coursesService.loadAllCoursesLessons(courseId).pipe(startWith([]));

    this.data$ = combineLatest([course$, lessons$]).pipe(
      map(([course, lessons]) => {
        return {
          course,
          lessons
        }
      })
    )
  }


}











