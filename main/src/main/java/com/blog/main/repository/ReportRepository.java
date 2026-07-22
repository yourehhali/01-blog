package com.blog.main.repository;

import com.blog.main.entity.Report;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ReportRepository extends JpaRepository<Report, Long> {

    @Query("select r from Report r join fetch r.reporter order by r.createdAt desc")
    List<Report> findAllWithReporter();
}
