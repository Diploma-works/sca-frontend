package com.sca.repository;

import com.sca.model.Project;
import com.sca.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    /**
     * Найти все проекты пользователя
     */
    List<Project> findByOwnerOrderByCreatedAtDesc(User owner);
    
    /**
     * Найти проект по ID и владельцу
     */
    Optional<Project> findByIdAndOwner(Long id, User owner);
    
    /**
     * Проверить существование проекта по имени и владельцу
     */
    boolean existsByNameAndOwner(String name, User owner);
    
    /**
     * Найти проекты по типу
     */
    List<Project> findByOwnerAndTypeOrderByCreatedAtDesc(User owner, Project.ProjectType type);
    
    /**
     * Найти активные проекты пользователя
     */
    @Query("SELECT p FROM Project p WHERE p.owner = :owner AND p.status = 'ACTIVE' ORDER BY p.createdAt DESC")
    List<Project> findActiveProjectsByOwner(@Param("owner") User owner);
    
    /**
     * Найти проекты по части имени
     */
    @Query("SELECT p FROM Project p WHERE p.owner = :owner AND LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY p.createdAt DESC")
    List<Project> findProjectsByNameContaining(@Param("owner") User owner, @Param("searchTerm") String searchTerm);
} 