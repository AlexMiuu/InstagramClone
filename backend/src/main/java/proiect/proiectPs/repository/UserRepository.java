package proiect.proiectPs.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import proiect.proiectPs.entity.User;

@Repository
public interface UserRepository extends CrudRepository<User, Long> {
    User findByEmail(String email);
}
